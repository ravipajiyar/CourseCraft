import os

from dotenv import load_dotenv

from gemini_client import chat

load_dotenv()

# Create the model
generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 8192,
    "response_mime_type": "text/plain",
}


def get_notes_on(topic):
    prompt = f"write very clear and effective nots on {topic}"
    return chat(prompt, generation_config=generation_config)
