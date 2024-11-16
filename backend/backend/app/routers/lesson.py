import datetime
from backend.genie.tools import gen_lessons_with_model
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from backend.supabase_client import supabase
from backend.genie.datatypes import InstructionUnit

router = APIRouter()


class Lesson(BaseModel):
    lesson_id: str
    course_id: str
    chunk_id: str
    title: str
    subtitle: str
    bullet_points: list[str]


@router.get("/{course_id}", status_code=200)
async def get_lessons(course_id: str, user_id: str, request: Request):
    res = supabase.table("lessons").select("*").eq("course_id", course_id).execute()
    return res.data


@router.put("/{lesson_id}", status_code=200)
async def edit_test(lesson_id: str, user_id: str, data: Lesson, request: Request):
    res = (
        supabase.table("lessons")
        .update(
            {
                "title": data.title,
                "subtitle": data.subtitle,
                "bullet_points": data.bullet_points,
            }
        )
        .eq("lesson_id", lesson_id)
        .execute()
    )

    return res.data


@router.delete("/{lesson_id}", status_code=200)
async def delete_lesson(lesson_id: str, user_id: str, request: Request):
    res = supabase.table("lessons").delete().eq("lesson_id", lesson_id).execute()

    return res.data


@router.post("/generate-lessons/{course_id}", status_code=200)
async def generate_lessons(course_id: str, request: Request):
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

        # Fetch existing lessons for the course
        lessons_res = (
            supabase.table("lessons")
            .select("generated_at")
            .eq("course_id", course_id)
            .execute()
        )
        lessons = lessons_res.data

        if lessons:
            # Get the latest generated_at timestamp among the lessons
            latest_lesson_generated = max(
                datetime.datetime.fromisoformat(lesson["generated_at"])
                for lesson in lessons
            )

            # Compare timestamps
            if latest_chunk_modified <= latest_lesson_generated:
                # Chunks haven't changed since lessons were generated
                return {"message": "Lessons are up to date"}
            else:
                # Chunks have changed, delete existing lessons
                supabase.table("lessons").delete().eq("course_id", course_id).execute()
        else:
            # No lessons exist, proceed to generate
            pass

        # GET INSTRUCTIONS
        _instruct_res = (
            supabase.table("instruct")
            .select("title", "summary", "instructions")
            .eq("course_id", course_id)
            .execute()
        )
        instruct = InstructionUnit.model_validate(_instruct_res.data[0])
        # Generate lessons
        lessons_data = await gen_lessons_with_model(chunks, instruct)
        lessons_list = lessons_data["lessons"]  # Extract the list of lessons
        print(lessons_list)

        # Insert the lessons into the database
        formatted_lessons = []
        for chunk, lesson in zip(chunks, lessons_list):
            formatted_lesson = {
                "course_id": course_id,
                "chunk_id": chunk["chunk_id"],
                "title": lesson.title,
                "subtitle": lesson.subtitle,
                "bullet_points": lesson.bullet_points,
                "generated_at": datetime.datetime.now(
                    datetime.timezone.utc
                ).isoformat(),
            }
            formatted_lessons.append(formatted_lesson)
        print(formatted_lessons)
        supabase.table("lessons").insert(formatted_lessons).execute()

        return {"message": f"Generated {len(formatted_lessons)} lessons"}

    except Exception as e:
        print(f"Error in generate_lessons: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
