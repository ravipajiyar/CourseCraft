"""Shared Gemini client with automatic model fallback.

The Gemini free tier enforces a per-model request quota, and Google retires
model versions fairly often (gemini-1.5-flash and gemini-2.5-flash both now
return 404 for new accounts). Keeping a small ordered list of models and
retrying on the next one keeps the NLP service working in both cases.

Set GEMINI_MODEL in NLP/.env to pin a specific model; the remaining entries
are still used as fallbacks.
"""
import os

import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))

# Ordered by preference. The first one is the default.
MODEL_FALLBACKS = [
    model
    for model in [
        os.getenv('GEMINI_MODEL', 'gemini-3.8-flash'),
        'gemini-3.5-flash',
        'gemini-3.5-flash-lite',
        'gemini-3.1-flash-lite',
    ]
    if model
]

# Errors that mean "this model cannot serve the request right now".
_RETRYABLE = ('429', 'ResourceExhausted', '404', 'NotFound', 'not found',
              'no longer available', 'quota')


def _is_retryable(err):
    text = str(err)
    return any(marker in text for marker in _RETRYABLE)


def generate(prompt, generation_config=None, system_instruction=None):
    """Generate text for a prompt, falling back to the next model on failure."""
    last_error = None

    for name in MODEL_FALLBACKS:
        try:
            model = genai.GenerativeModel(
                model_name=name,
                generation_config=generation_config,
                system_instruction=system_instruction,
            )
            return model.generate_content(prompt).text
        except Exception as err:  # noqa: BLE001 - the SDK raises many types
            last_error = err
            print(f'[gemini] {name} failed: {str(err)[:200]}', flush=True)
            if not _is_retryable(err):
                raise

    raise last_error


def chat(prompt, generation_config=None, system_instruction=None):
    """Chat-style generation with the same fallback behaviour as generate()."""
    last_error = None

    for name in MODEL_FALLBACKS:
        try:
            model = genai.GenerativeModel(
                model_name=name,
                generation_config=generation_config,
                system_instruction=system_instruction,
            )
            session = model.start_chat(history=[])
            return session.send_message(prompt).text
        except Exception as err:  # noqa: BLE001 - the SDK raises many types
            last_error = err
            print(f'[gemini] {name} failed: {str(err)[:200]}', flush=True)
            if not _is_retryable(err):
                raise

    raise last_error
