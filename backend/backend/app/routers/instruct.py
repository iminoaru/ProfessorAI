from fastapi import APIRouter, Request, HTTPException  # noqa
from backend.supabase_client import supabase
from backend.genie.tools import gen_instructions_with_model, gen_image_with_model
from backend.genie.datatypes import InstructionUnit

router = APIRouter()


@router.get("/{course_id}", status_code=200)
async def get_instruct(course_id: str, user_id: str, request: Request):
    res = (
        supabase.table("instruct")
        .select("course_id, title, summary, instructions")
        .eq("course_id", course_id)
        .execute()
    )

    image_url = (
        supabase.table("courses")
        .select("image_url")
        .eq("course_id", course_id)
        .execute()
    )

    if res.data and image_url.data:
        res.data[0]["image_url"] = image_url.data[0]["image_url"]

    return res.data


@router.post("/{course_id}", status_code=200)
async def create_or_update_instruct(
    course_id: str, user_id: str, data: InstructionUnit, request: Request
):
    # Check if the course_id already exists
    existing_record = (
        supabase.table("instruct").select("*").eq("course_id", course_id).execute()
    )

    if existing_record.data:
        # Update the existing record
        res = (
            supabase.table("instruct")
            .update(
                {
                    "title": data.title,
                    "summary": data.summary,
                    "instructions": data.instructions,
                }
            )
            .eq("course_id", course_id)
            .execute()
        )
    else:
        # Insert a new record
        res = (
            supabase.table("instruct")
            .insert(
                {
                    "course_id": course_id,
                    "title": data.title,
                    "summary": data.summary,
                    "instructions": data.instructions,
                }
            )
            .execute()
        )

    # TODO (sarthak):
    # fetch the document / markdown content from course id
    # instructions: InstructionUnit = await gen_instructions_with_model(document)

    return res.data


@router.post("/generate-instructions/{course_id}", status_code=200)
async def generate_instructions(course_id: str, user_id: str, request: Request):
    res = (
        supabase.table("courses")
        .select("markdown")
        .eq("course_id", course_id)
        .execute()
    )

    InstructionUnit = await gen_instructions_with_model(res.data[0]["markdown"])

    check = supabase.table("instruct").select("*").eq("course_id", course_id).execute()
    # change the course title to this title
    supabase.table("courses").update({"name": InstructionUnit.title}).eq(
        "course_id", course_id
    ).execute()

    # generate an image for the course
    image_url = await gen_image_with_model(
        f"A high fidelity render of a creative visualization about - {InstructionUnit.title}, "
    )
    supabase.table("courses").update({"image_url": image_url}).eq(
        "course_id", course_id
    ).execute()

    if check.data:
        return check.data

    else:
        push = (
            supabase.table("instruct")
            .insert(
                {
                    "course_id": course_id,
                    "title": InstructionUnit.title,
                    "summary": InstructionUnit.summary,
                    "instructions": InstructionUnit.instructions,
                }
            )
            .execute()
        )
        ret = push.data[0]
        return ret
