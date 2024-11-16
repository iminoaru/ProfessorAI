from pydantic import BaseModel
import io
import base64
from PIL import Image
import openai
import fitz

client = openai.OpenAI()


class ImageDescription(BaseModel):
    description: str


def gpt_image_description(image, mime_type):
    img_byte_arr = io.BytesIO()
    image.save(img_byte_arr, format=mime_type.split("/")[-1].upper())
    img_base64 = base64.b64encode(img_byte_arr.getvalue()).decode("utf-8")

    response = client.beta.chat.completions.parse(
        model="gpt-4o",
        messages=[
            {
                "role": "system",
                "content": "Extract text from images verbatim for document transcription.",
            },
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Here is the image:"},
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:{mime_type};base64,{img_base64}"},
                    },
                ],
            },
        ],
        response_format=ImageDescription,
    )

    return response.choices[0].message.parsed.description


def process_pdf(content: bytes) -> str:
    with fitz.open(stream=content, filetype="pdf") as doc:
        text = ""
        image_descriptions = []
        for page in doc:
            text += page.get_text() + "\n\n"

            for img in page.get_images(full=True):
                base_image = doc.extract_image(img[0])
                image_bytes = base_image["image"]
                mime_type = (
                    "image/jpeg" if base_image["colorspace"] == 1 else "image/png"
                )

                image = Image.open(io.BytesIO(image_bytes))
                description = gpt_image_description(image, mime_type)
                image_descriptions.append(description)

        return text + "\n\nImage Descriptions:\n" + "\n\n".join(image_descriptions)
