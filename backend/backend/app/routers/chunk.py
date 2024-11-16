from fastapi import APIRouter, Request
from backend.supabase_client import supabase
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class Chunk(BaseModel):
    chunk_id: str
    source_id: str
    chunk_title: str
    chunk_content: str

@router.get('/{source_id}', status_code=200)
async def get_chunk(source_id: str, request: Request):
    res = supabase.table("chunks").select("*").eq("source_id", source_id).execute()
    return res.data

@router.put('/{chunk_id}', status_code=200)
async def edit_chunk(chunk_id: str, user_id: str, data: Chunk, request: Request):
    res = supabase.table("chunks").update({
        "chunk_title": data.chunk_title,
        "chunk_content": data.chunk_content,
        "last_modified": datetime.utcnow().isoformat()
    }).eq("chunk_id", chunk_id).execute()
    return res.data

@router.delete('/delete-chunks/{chunk_id}', status_code=200)
async def delete_chunk(chunk_id: str, user_id: str, request: Request):
    res = supabase.table("chunks").delete().eq("chunk_id", chunk_id).execute()
    return res.data