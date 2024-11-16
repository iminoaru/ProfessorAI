from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, AsyncGenerator
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage, AIMessage
from backend.supabase_client import supabase
import os
import logging
from collections import defaultdict

router = APIRouter()
logger = logging.getLogger(__name__)

# In-memory storage for recent messages (user_id -> list of messages), will migrate to db later
recent_messages = defaultdict(list)
MAX_HISTORY = 4  # Store last 2 human + 2 AI messages

class ChatRequest(BaseModel):
    course_id: str
    message: str
    user_id: str

async def get_course_details(course_id: str) -> dict:
    res = supabase.table("instruct").select("title, summary").eq("course_id", course_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Course not found")
    return res.data[0]

async def get_chunks(course_id: str) -> list:
    res = supabase.table("chunks").select("*").eq("source_id", course_id).limit(3).execute()
    return res.data

async def generate_response(messages: List[dict]) -> AsyncGenerator[str, None]:
    llm = ChatOpenAI(
        model_name="gpt-4o-mini",
        temperature=0.7,
        streaming=True,
        api_key=os.getenv("OPENAI_API_KEY")
    )

    async for chunk in llm.astream(messages):
        if chunk.content:
            yield chunk.content

@router.post("/{course_id}/chat")
async def chat(course_id: str, chat_request: ChatRequest):
    try:
        course_details = await get_course_details(course_id)
        chunks = await get_chunks(course_id)
        
        chunks_context = "\n\n".join([
            f"Topic: {chunk['chunk_title']}\nContent: {chunk['chunk_content']}"
            for chunk in chunks
        ])
        
        # Get existing messages for this user
        user_messages = recent_messages[chat_request.user_id]
        
        messages = [
            SystemMessage(content=f"""
            You are an AI tutor helping students understand course content.
            Use the following course details and content chunks to answer questions:

            Title: {course_details['title']}
            Summary: {course_details['summary']}

            Course Content:
            {chunks_context}

            Keep responses focused on course material while maintaining a broad perspective.
            If asked about something outside course scope, relate it back to course content if possible.
            Be concise but informative. Add some emojis and make it more engaging.
            """),
        ]
        
        # Add recent message history
        messages.extend(user_messages)
        
        # Add current message
        messages.append(HumanMessage(content=chat_request.message))

        # Create a wrapper to capture the full response
        full_response = []
        async def event_generator():
            async for token in generate_response(messages):
                full_response.append(token)
                yield f"data: {token}\n\n"
            yield "data: [DONE]\n\n"
            
            # After generating full response, update the message history
            user_messages.append(HumanMessage(content=chat_request.message))
            user_messages.append(AIMessage(content=''.join(full_response)))
            
            # Keep only the last MAX_HISTORY messages
            if len(user_messages) > MAX_HISTORY:
                recent_messages[chat_request.user_id] = user_messages[-MAX_HISTORY:]

        return StreamingResponse(event_generator(), media_type="text/event-stream")
    except Exception as e:
        logger.error(f"An error occurred: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
