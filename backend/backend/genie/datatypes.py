from pydantic import BaseModel, Field
from typing import Literal, Optional

SupportedModel = Literal["gpt-4o-mini"]


class InstructionUnit(BaseModel):
    title: str = Field(
        description="A name based on the provided content. It should be descriptive and informative."
    )
    summary: str = Field(
        description="A detailed summary (at least 20 lines) of the content capturing the key points, insights, takeaways and potential areas of confusion."
    )
    instructions: str = Field(
        description="Depending on the complexity and quantity of the text, create instructions that will be used to guide a AI generation to create quizzes appropriately. This is very crucial."
    )
    # tags: list[str]


# class ReportUnit(BaseModel):
#     summary: str
#     tags: list[str]
#     key_insights: list[str]
#     testable_questions: list[str]


# ingest types
class ContentSource(BaseModel):
    type: Literal["web_link"]
    source: str


class SaveMarkdownRequest(BaseModel):
    edited: str
    author: str


class ExcerptItem(BaseModel):
    title: str
    start: str
    end: str


class ExcerptData(BaseModel):
    excerpts: list[ExcerptItem]


# chunk types
class ContentChunk(BaseModel):
    title: str
    content: str


class ModelChunk(BaseModel):
    model: SupportedModel
    chunks: list[ContentChunk]


class SaveChunksRequest(BaseModel):
    generated: list[ModelChunk]
    final: list[ContentChunk]


class Lesson(BaseModel):
    title: str
    subtitle: str
    bullet_points: list[str]


class SaveLessonsRequest(BaseModel):
    edited: list[Lesson]


# tests gen types
class LessonText(BaseModel):
    title: str
    explanation: str


class LessonTest(BaseModel):
    question: str
    correct_answer: str = Field(
        ...,
        description="The correct answer to the question. This should be similar in length to incorrect answers.",
    )
    incorrect_answers: list[str] = Field(
        ...,
        description="A list of three plausible but incorrect answers. These should be similar in length to the correct answer.",
    )
    explanation: str = Field(
        ...,
        description="An explanation of why the correct answer is correct. Based on the lesson content, but doesn't reference the lesson explicitly.",
    )


class TestItem(BaseModel):
    lesson_title: str
    questions: list[LessonTest]


class SaveTestsRequest(BaseModel):
    edited: list[TestItem]


# graph gen types
class LessonGraphNode(BaseModel):
    title: str


class LessonGraphEdge(BaseModel):
    head: str
    tail: str


class LessonGraph(BaseModel):
    nodes: list[LessonGraphNode]
    edges: list[LessonGraphEdge]


# final asset gen types
class CourseChapter(BaseModel):
    chapter_title: str
    child_titles: Optional[list[str]] = None


class LessonTestQuestion(BaseModel):
    question: str
    correct_answer: str
    incorrect_answers: list[str]
    explanation: str
