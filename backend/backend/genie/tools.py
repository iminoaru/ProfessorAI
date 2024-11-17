from anthropic import AsyncAnthropic
from fuzzysearch import find_near_matches
from typing import List
from .datatypes import (
    SupportedModel,
    ContentChunk,
    TestItem,
    ExcerptData,
    Lesson,
    InstructionUnit,
)
from fastapi.encoders import jsonable_encoder
import os
import json
import openai

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
# REPLICATE_API_KEY = os.getenv("REPLICATE_API_KEY")
SUPPORTED_MODELS: List[SupportedModel] = ["gpt-4o-mini"]
MODEL_DEPLOYED = "gpt-4o-mini"  # "gpt-4o-2024-08-06"
PROMPTS_DIR = os.path.join(os.path.dirname(__file__), "prompts")

client = openai.OpenAI(api_key=OPENAI_API_KEY)
anthropic = AsyncAnthropic(api_key=ANTHROPIC_API_KEY)

# MODEL_DEPLOYED = "gpt-4o-mini"


def get_match(excerpt, source, direction):
    """
    # HACK: fuzzy search of excerpt in source doesn't always work well
    # with Levenshtein distance, so we resort to the following:
    # 1) Attempt to match full excerpt
    # 2) If full excerpt returns no match, attempt either first or last 25 chars of excerpt
    # 3) Else return None (these will get filtered later)
    # Note that depending on max_l_dist, might result in undesirable matches
    """
    matches = find_near_matches(excerpt, source, max_l_dist=1)
    if len(matches) > 0:
        return matches[0]
    if direction == "start":
        matches = find_near_matches(excerpt[:25], source, max_l_dist=1)
        if len(matches) > 0:
            return matches[0]
    elif direction == "end":
        matches = find_near_matches(excerpt[-25:], source, max_l_dist=1)
        if len(matches) > 0:
            return matches[0]

    return None


def convert_excerpts_to_chunks(excerpts, source_md):
    matches = [
        (
            ex.title,
            get_match(ex.start, source_md, "start"),
            get_match(ex.end, source_md, "end"),
        )
        for ex in excerpts
    ]
    matches = [
        (title, m1.start, m2.end)
        for (title, m1, m2) in matches
        if m1 is not None and m2 is not None
    ]
    chunks = [
        ContentChunk(title=title, content=source_md[start:end])
        for (title, start, end) in matches
    ]
    return chunks


async def gen_chunks_with_model(
    content: str
):  # xxx add instructions as params {title, summary, instructions}
    with open(os.path.join(PROMPTS_DIR, "chunk.txt")) as f:
        sys_prompt = f.read()

    user_prompt = json.dumps({"markdown_text": content})

    completion = client.beta.chat.completions.parse(
        model=MODEL_DEPLOYED,
        messages=[
            {"role": "system", "content": sys_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0,
        seed=1337,
        response_format=ExcerptData,
    )

    ret = completion.choices[0].message.parsed
    excerpts = ret.excerpts
    final_chunks = convert_excerpts_to_chunks(excerpts, content)
    return final_chunks


async def gen_lessons_with_model(
    chunks: list[ContentChunk], instructions: InstructionUnit
):
    with open(os.path.join(PROMPTS_DIR, "lesson_content.txt")) as f:
        sys_prompt = f.read()

    sys_prompt += f"While creating the lesson content, keep in mind the instructions that will be used to create the tests: {instructions.instructions}"

    completions = [
        client.beta.chat.completions.parse(
            model=MODEL_DEPLOYED,
            messages=[
                {"role": "system", "content": sys_prompt},
                {
                    "role": "user",
                    "content": json.dumps(jsonable_encoder(chunk)),
                },
            ],
            temperature=0,
            seed=1337,
            response_format=Lesson,
        )
        for chunk in chunks
    ]

    lessons = [c.choices[0].message.parsed for c in completions]

    lessons = [
        Lesson(
            title=lesson.title,
            subtitle=lesson.subtitle,
            bullet_points=lesson.bullet_points,
        )
        for lesson in lessons
    ]

    return {"lessons": lessons}


async def gen_tests_with_model(
    chunks: List[ContentChunk], instructions: InstructionUnit, max_tokens: int = 4000
):  # xxx add instructions as params {title, summary, instructions}
    with open(os.path.join(PROMPTS_DIR, "tests.txt")) as f:
        sys_prompt = f.read()

    sys_prompt += f"Follow these instructions while creating the test questions: {instructions.instructions}"

    completions = [
        client.beta.chat.completions.parse(
            model=MODEL_DEPLOYED,
            messages=[
                {"role": "system", "content": sys_prompt},
                {
                    "role": "user",
                    "content": json.dumps(jsonable_encoder(chunk)),
                },
            ],
            temperature=0,
            max_tokens=max_tokens,
            seed=1337,
            response_format=TestItem,
        )
        for chunk in chunks
    ]

    tests = [c.choices[0].message.parsed for c in completions]
    return tests


async def gen_image_with_model(prompt: str) -> str:
    """
    Returns a URL to an image generated by a model.
    """
    # currently returns a base64 image that we need to upload for now / can return the image to the browser perhaps
    # _image_base64 = replicate.run("black-forest-labs/flux-schnell", input={"prompt": prompt})[0]
    image_url = "https://replicate.delivery/yhqm/4fwNtxYFt1VaF6sdmMebefgmehuObjOHxgKRyiNRnJ96jINcC/out-0.webp"
    return image_url


# async def gen_report_with_model(documents: list[str]):
#     """
#     documents => { document => summary, tags, key-insights, testable-questions } x N => title, tags, summary, instructions
#     summary: a summary of all the documents, common themes, and key insights, talk about the big picture
#     instructions: a set of instructions on what to do with the report, what to learn, what to think about, what to do with the report that will be used by the model to generate a quiz
#     """
#     completions = [
#         client.beta.chat.completions.parse(
#             model=MODEL_DEPLOYED,
#             messages=[
#                 {
#                     "role": "system",
#                     "content": "You are a helpful assistant that summarizes documents and understand the overall big picture.",
#                 },
#                 {
#                     "role": "user",
#                     "content": json.dumps({"document": document}),
#                 },
#             ],
#             temperature=0,
#             seed=1337,
#             response_format=InstructionUnit,
#         )
#         for document in documents
#     ]

#     report_units = [c.choices[0].message.parsed for c in completions]
#     concatenated_summaries = " ".join([unit.summary for unit in report_units])

#     completion = client.beta.chat.completions.create(
#         model=MODEL_DEPLOYED,
#         messages=[
#             {
#                 "role": "system",
#                 "content": "You are a helpful assistant that creates a final report based on the summaries provided.",
#             },
#             {"role": "user", "content": concatenated_summaries},
#         ],
#         temperature=0,
#         seed=1337,
#         response_format=InstructionUnit,
#     )

#     final_report = completion.choices[0].message.parsed

#     return final_report


async def gen_instructions_with_model(document: str):
    completion = client.beta.chat.completions.parse(
        model=MODEL_DEPLOYED,
        messages=[
            {
                "role": "system",
                "content": "You are a helpful assistant that summarizes documents in detail and understand the overall big picture. You want to guide test generation and impart the best lessons throught assessment.",
            },
            {
                "role": "user",
                "content": json.dumps({"document": document}),
            },
        ],
        temperature=0,
        seed=1337,
        response_format=InstructionUnit,
    )

    instructions = completion.choices[0].message.parsed

    return instructions
