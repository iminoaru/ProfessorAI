from fastapi import APIRouter
from pydantic import BaseModel
from backend.supabase_client import supabase

router = APIRouter()

class Score(BaseModel):
    course_id: str
    correct_score: int
    incorrect_score: int


@router.post('/add-scores', status_code=200)
async def add_scores(user_id: str, data: Score):
    # Check if the score already exists
    check = supabase.table("scores").select("*").eq("user_id", user_id).eq("course_id", data.course_id).execute()

    if check.data:
        supabase.table("scores").update({
            "correct_score": data.correct_score,
            "incorrect_score": data.incorrect_score
        }).eq("user_id", user_id).eq("course_id", data.course_id).execute()
        
        return {"msg": "updated"}
    
    else:
        supabase.table("scores").insert({
            "user_id": user_id,
            "course_id": data.course_id,
            "correct_score": data.correct_score,
            "incorrect_score": data.incorrect_score
        }).execute()
        
        return {"msg": "inserted"}


@router.get('/get-scores/{course_id}', status_code=200)
async def get_scores(user_id: str, course_id: str):
    res = supabase.table("scores").select("*").eq("user_id", user_id).eq("course_id", course_id).execute()
    return res.data
