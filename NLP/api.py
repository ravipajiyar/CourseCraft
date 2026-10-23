from flask import Flask, request, jsonify
from dotenv import load_dotenv
from question_generator_gemini import generate_questions_gemini
from expected_answer_generator import generate_expected_answers
from generate_module import generate_module
from get_notes_on import get_notes_on
import json
import os

# Load NLP/.env no matter which directory the service is started from.
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env'))

app = Flask(__name__)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'coursecraft-nlp'})

@app.route('/generate-questions', methods=['POST'])
def get_generated_questions():

    data = request.get_json()
    topic = data.get('topic')
    questions = generate_questions_gemini(topic)
    # print(questions)

    # response = json.loads(questions)
    return jsonify(questions)

@app.route('/generate-module', methods=['POST'])
def generate_course_module():
    data = request.get_json()
    questions = data.get("questions")
    topic = data.get("topic")
    user_answers = data.get("answers")

    exceptd_answers = generate_expected_answers(topic, questions)

    module =  generate_module(exceptd_answers, user_answers)


    # start_index = module.find("{")
    # end_index = module.rfind("}")+1
    return jsonify(module)
@app.route('/get-notes', methods=['POST'])
def get_notes():
    data = request.get_json()
    topic = data.get("topic")
    notes  = get_notes_on(topic)
    return jsonify(notes)
    


if __name__ == '__main__':
    import os
    # Render (and most PaaS providers) inject PORT. NLP_PORT wins so the
    # service can also run next to the API on a fixed internal port.
    port = int(os.getenv('NLP_PORT') or os.getenv('PORT') or 3001)
    # Bind to 0.0.0.0 — the default 127.0.0.1 is unreachable from outside
    # the container.
    app.run(host='0.0.0.0', port=port, debug=os.getenv('FLASK_DEBUG') == '1')

# test this