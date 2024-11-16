import datetime
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from backend.supabase_client import supabase
from backend.genie.tools import gen_tests_with_model
from backend.genie.datatypes import InstructionUnit

router = APIRouter()


class Test(BaseModel):
    test_id: str
    chunk_id: str
    course_id: str
    test_question: str
    correct_option: str
    incorrect_options: list[str]


@router.get("/{course_id}", status_code=200)
async def get_tests(course_id: str, request: Request):
    res = supabase.table("tests").select("*").eq("course_id", course_id).execute()
    return res.data


@router.put("/{test_id}", status_code=200)
async def edit_test(test_id: str, user_id: str, data: Test, request: Request):
    res = (
        supabase.table("tests")
        .update(
            {
                "test_question": data.test_question,
                "correct_option": data.correct_option,
                "incorrect_options": data.incorrect_options,
            }
        )
        .eq("test_id", test_id)
        .execute()
    )

    return res.data


@router.delete("/{test_id}", status_code=200)
async def delete_test(test_id: str, user_id: str, request: Request):
    res = supabase.table("tests").delete().eq("test_id", test_id).execute()

    return res.data


@router.post("/submit", status_code=200)
async def submit_tests(tests: list[Test], user_id: str, request: Request):
    # logic
    return {"message": "Tests submitted successfully", "tests": tests}


@router.post("/generate-tests/{course_id}", status_code=200)
async def generate_tests(course_id: str, request: Request):
    try:
        # Fetch the chunks for the course
        chunk_res = (
            supabase.table("chunks").select("*").eq("source_id", course_id).execute()
        )
        if not chunk_res.data:
            return {"error": "No chunks found for this course"}
        chunks = chunk_res.data

        # Get the latest last_modified timestamp among the chunks
        latest_chunk_modified = max(
            datetime.datetime.fromisoformat(chunk["last_modified"]) for chunk in chunks
        )

        # Fetch existing tests for the course
        tests_res = (
            supabase.table("tests")
            .select("generated_at")
            .eq("course_id", course_id)
            .execute()
        )
        tests = tests_res.data

        if tests:
            # Get the latest generated_at timestamp among the tests
            latest_test_generated = max(
                datetime.datetime.fromisoformat(test["generated_at"]) for test in tests
            )

            # Compare timestamps
            if latest_chunk_modified <= latest_test_generated:
                # Chunks haven't changed since tests were generated
                return {"message": "Tests are up to date"}
            else:
                # Chunks have changed, delete existing tests
                supabase.table("tests").delete().eq("course_id", course_id).execute()
        else:
            # No tests exist, proceed to generate
            pass

        # GET INSTRUCTIONS
        _instruct_res = (
            supabase.table("instruct")
            .select("title", "summary", "instructions")
            .eq("course_id", course_id)
            .execute()
        )
        instruct = InstructionUnit.model_validate(_instruct_res.data[0])
        # Generate tests
        tests = await gen_tests_with_model(chunks, instruct)

        # Insert the tests into the database
        formatted_tests = []
        for chunk, test in zip(chunks, tests):
            for question in test.questions:
                formatted_test = {
                    "course_id": course_id,
                    "chunk_id": chunk["chunk_id"],
                    "test_question": question.question,
                    "correct_option": question.correct_answer,
                    "incorrect_options": question.incorrect_answers,
                    "generated_at": datetime.datetime.now(
                        datetime.timezone.utc
                    ).isoformat(),
                }
                formatted_tests.append(formatted_test)

        supabase.table("tests").insert(formatted_tests).execute()

        return {"message": f"Generated {len(formatted_tests)} test questions"}

    except Exception as e:
        print(f"Error in generate_tests: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
