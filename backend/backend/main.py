from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from backend.app.routers import content
from backend.app.routers import chunk
from backend.app.routers import test
from backend.app.routers import course
from backend.app.routers import score
from backend.app.routers import lesson
from backend.app.routers import media
from backend.app.routers import instruct
from backend.app.routers import chat

from dotenv import load_dotenv

load_dotenv()

app = FastAPI()


app.include_router(content.router, prefix="/generate", tags=["generate"])
app.include_router(chunk.router, prefix="/chunk", tags=["chunk"])
app.include_router(test.router, prefix="/test", tags=["test"])
app.include_router(course.router, prefix="/course", tags=["course"])
app.include_router(score.router, prefix="/score", tags=["score"])
app.include_router(lesson.router, prefix="/lesson", tags=["lesson"])
app.include_router(media.router, prefix="/media", tags=["media"])
app.include_router(instruct.router, prefix="/instruct", tags=["instruct"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://elevan.vercel.app",
        "https://elevan-me.vercel.app",
    ],  # Replace with your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the aggregated router


@app.get("/")
async def root():
    return {"message": "Hello World"}
