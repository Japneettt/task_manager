
import json
from groq import Groq
from app.core.config import settings
from sqlalchemy.orm import Session
from app.chatbot.vector_store import search_similar_docs
from app.chatbot.intent_router import detect_intent
from app.chatbot.data_fetcher import fetch_user_data

client = Groq(api_key=settings.GROQ_API_KEY)
GROQ_MODEL = "llama-3.1-8b-instant"


def get_chatbot_response(
    user_question: str,
    chat_history: list = [],
    user=None,        # ← the logged-in User object
    db: Session = None  # ← the DB session
) -> str:
    """
    Upgraded RAG pipeline:
    1. Detect intent (data question vs knowledge question)
    2a. If DATA → fetch real data from DB, build prompt with that data
    2b. If KNOWLEDGE → search ChromaDB for relevant docs
    3. Send to Llama 3.1 via Groq and return answer
    """

    # Step 1: Detect intent
    intent_result = detect_intent(user_question)
    intent = intent_result["intent"]
    data_type = intent_result["data_type"]

    # ── DATA QUESTION ────────────────────────────────────────────────
    if intent == "data" and user is not None and db is not None:

        # Step 2a: Fetch real user data from DB
        real_data = fetch_user_data(data_type, user, db,team_name=intent_result.get("team_name"))

        system_prompt = f"""You are a helpful AI assistant for Workivo, a project management tool.
You are talking to {user.first_name} {user.last_name}.
You have been given REAL DATA fetched live from their account. 
# Use ONLY this data. Do NOT guess or make up numbers.
You MUST ONLY use the provided data.
DO NOT generate, assume, or invent:
- team names
- board names
- member names
- tasks

The data is 100% accurate — trust it completely.

Key rules:
- For counts, use the exact numbers in the data (e.g. "total_teams", "owned_team_count")
- For team ownership, use "teams_you_own" list for teams they own
- For team membership, use "teams_you_are_member_of" for teams they joined
- Use bullet points and emojis to make answers friendly
- If a list is empty, say so positively
--- USER'S REAL DATA ---
{json.dumps(real_data, indent=2, default=str)}
--- END OF DATA ---
"""

    # ── KNOWLEDGE QUESTION ───────────────────────────────────────────
    else:
        # Step 2b: Search ChromaDB for relevant Workivo docs
        relevant_docs = search_similar_docs(user_question, n_results=3)

        if not relevant_docs:
            context = "No specific documentation found for this query."
        else:
            context = "\n\n---\n\n".join(relevant_docs)

        user_name = f"{user.first_name}" if user else "there"

        system_prompt = f"""You are a helpful AI assistant for Workivo, a project management tool similar to Trello.
You help users understand how to use Workivo's features.
You are talking to {user_name}.

Use ONLY the documentation below to answer. If the answer is not in the docs,
say "I don't have information about that. Please check the Help section or contact support."

Be friendly, clear, and use bullet points for steps.

--- WORKIVO DOCUMENTATION ---
{context}
--- END DOCUMENTATION ---
"""

    # Step 3: Build messages and call Llama via Groq
    messages = [{"role": "system", "content": system_prompt}]

    for turn in chat_history[-6:]:
        messages.append({"role": turn["role"], "content": turn["content"]})

    messages.append({"role": "user", "content": user_question})

    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=messages,
        max_tokens=600,
        temperature=0.3,
    )

    return response.choices[0].message.content