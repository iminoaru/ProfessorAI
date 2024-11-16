from fastapi import APIRouter, Request
from typing import List, Optional
from pydantic import BaseModel
from backend.supabase_client import supabase

router = APIRouter()

class Course(BaseModel):
    course_id: str
    author_id: str
    source: str
    name: str
    raw_content: str
    markdown: str
    
class CourseInfo(BaseModel):
    course_id: str
    author_id: str
    name: str
    source: str
    total_questions: int

@router.get('/course-info', status_code=200)
async def get_course_info(user_id: str, request: Request):
    courses_res = supabase.table("courses").select("course_id, author_id, name, source").eq("author_id", user_id).execute()
    courses = courses_res.data

    course_info_list = []
    for course in courses:
        tests_res = supabase.table("tests").select("test_id").eq("course_id", course["course_id"]).execute()
        print(tests_res)
        total_questions = len(tests_res.data)
        print(total_questions)

        course_info = CourseInfo(
            course_id=course["course_id"],
            author_id=course["author_id"],
            name=course["name"],
            source=course["source"],
            total_questions=total_questions
        )
        course_info_list.append(course_info)

    print(course_info_list)
    return course_info_list


@router.delete('/delete-course/{course_id}', status_code=200)
async def delete_course(course_id: str, user_id: str, request: Request):
    res = supabase.table("courses").delete().eq("course_id", course_id).eq("author_id", user_id).execute()
    return res.data
