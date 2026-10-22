import json

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


def generate_expected_answers(topic, questions):
    system_instruction = f"""You are an expert on {topic}. Provide detailed and correct answers to the following questions:
    {questions}

        Formatting: Return the questions in the following format:
    {{
   "topic": "{topic},
   "questions": {{
      "basic": {{questions: ["<question 1>", "<question 2>", ...],
      expected_answers: ["<answer 1>", "<answer 2>", ...]
      }},
      "intermediate": {{questions:["<question 1>", "<question 2>", ...],
      expected_answers: ["<answer 1>", "<answer 2>", ...]
      }},
      "advanced": {{questions:["<question 1>", "<question 2>", ...],
      expected_answers: ["<answer 1>", "<answer 2>", ...]
      }}
        }}
    }}
    """

    response = chat(
        f"{questions}",
        generation_config=generation_config,
        system_instruction=system_instruction,
    )

    start_index = response.find("{")
    end_index = response.rfind("}") + 1
    return json.loads(response[start_index:end_index])
