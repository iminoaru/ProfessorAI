from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from backend.supabase_client import supabase
from typing import Dict, List, Literal
from backend.genie.utils import ingest_url  # Ensure this import is correct
from backend.genie.tools import gen_chunks_with_model

router = APIRouter()


class ContentSource(BaseModel):
    type: Literal["web_link", "pdf", "pptx", "docx", "audio", "xml"]
    source: str


class Content(BaseModel):
    link: str
    name: str


async def ingest_source(source: ContentSource):
    try:
        markdown = await ingest_url(source.source)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error during content ingestion: {e}",
        )
    return {"markdown": markdown}


@router.post("/content", status_code=200)
async def handle_content(user_id: str, data: Content, request: Request):
    # Process the link and extract content
    source = ContentSource(type="web_link", source=data.link)
    content = await ingest_source(source)

    # TODO: fix this
    check = (
        supabase.table("courses")
        .select("*")
        .eq("source", data.link)
        .eq("author_id", user_id)
        .execute()
    )

    if check.data:
        return check.data[0]["course_id"]

    else:
        # Insert into database
        res = (
            supabase.table("courses")
            .insert(
                {
                    "author_id": user_id,
                    "source": data.link,
                    "name": data.name,
                    "markdown": content["markdown"],
                }
            )
            .execute()
        )

        print(res.data[0]["course_id"])

        return res.data[0]["course_id"]


@router.get("/content/{course_id}", status_code=200)
async def get_content(course_id: str, user_id: str, request: Request):
    print(course_id)
    print(user_id)
    res = (
        supabase.table("courses")
        .select("markdown", "name")
        .eq("course_id", course_id)
        .eq("author_id", user_id)
        .execute()
    )
    return res.data


class UpdateContent(BaseModel):
    name: str
    markdown: str


@router.put("/update-course/{course_id}", status_code=200)
async def update_course(
    course_id: str, user_id: str, data: UpdateContent, request: Request
):
    try:
        # Fetch existing course data
        existing_course = (
            supabase.table("courses")
            .select("name, markdown")
            .eq("course_id", course_id)
            .eq("author_id", user_id)
            .execute()
        )
        if not existing_course.data:
            raise HTTPException(status_code=404, detail="Course not found")

        existing_name = existing_course.data[0]["name"]
        existing_markdown = existing_course.data[0]["markdown"]

        # Check if content has changed
        content_changed = (existing_name != data.name) or (
            existing_markdown != data.markdown
        )

        # Update the course if content has changed
        if content_changed:
            _res = (
                supabase.table("courses")
                .update({"name": data.name, "markdown": data.markdown})
                .eq("course_id", course_id)
                .eq("author_id", user_id)
                .execute()
            )
            # Delete existing chunks for this course_id
            _delete_response = (
                supabase.table("chunks").delete().eq("source_id", course_id).execute()
            )
        else:
            # If content hasn't changed, check if chunks exist
            chunks_response = (
                supabase.table("chunks")
                .select("chunk_id")
                .eq("source_id", course_id)
                .execute()
            )
            if chunks_response.data:
                # Chunks exist and content hasn't changed; no action needed
                return {"message": "Content hasn't changed and chunks are up to date"}

        # Generate chunks (either first time or after content change)
        markdown = data.markdown if content_changed else existing_markdown

        # instructs = supabase.table("instruct").select("title", "summary", "instructions").eq("course_id", course_id).execute()
        chunks = await gen_chunks_with_model(markdown)

        # Prepare chunks data
        chunks_data: List[Dict[str, str]] = [
            {
                "chunk_title": chunk.title,
                "chunk_content": chunk.content,
                "source_id": course_id,
            }
            for chunk in chunks
        ]

        # Insert chunks
        result = supabase.table("chunks").insert(chunks_data).execute()
        if result.data:
            action = "updated and" if content_changed else "generated and"
            return {"message": f"Content {action} inserted {len(chunks_data)} chunks"}
        else:
            raise HTTPException(status_code=500, detail="Failed to insert chunks")

    except Exception as e:
        print(f"Error in update_course: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
