# app/chatbot/router.py  — REPLACE the whole file

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List

from app.core.database import get_db
from app.api.endpoints.users import get_current_user
from app.models.user import User
from app.chatbot.chatbot_service import get_chatbot_response

router = APIRouter()


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    question: str
    history: Optional[List[ChatMessage]] = []


class ChatResponse(BaseModel):
    answer: str


@router.post("/ask", response_model=ChatResponse)
def ask_chatbot(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),          # ← add db here
):
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    history = [
        {"role": msg.role, "content": msg.content}
        for msg in request.history
    ]

    try:
        answer = get_chatbot_response(
            user_question=request.question,
            chat_history=history,
            user=current_user,   # ← pass user
            db=db,               # ← pass db
        )
        return ChatResponse(answer=answer)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chatbot error: {str(e)}")


@router.get("/health")
def chatbot_health():
    return {"status": "ok", "message": "Workivo chatbot is running"}
# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session
# from pydantic import BaseModel
# from app.core.database import get_db
# from app.api.endpoints.users import get_current_user
# from app.models.user import User
# from typing import Optional, List
# from app.chatbot.chatbot_service import get_chatbot_response
# router=APIRouter()

# class ChatMessage(BaseModel):
#     role: str
#     content: str
# class ChatRequest(BaseModel):
#     question:str
#     history: Optional[List[ChatMessage]] = []
# class ChatResponse(BaseModel):
#     answer: str
# @router.post("/ask", response_model=ChatResponse)
# def ask_chatbot(
#     request: ChatRequest,
#     current_user: User = Depends(get_current_user),   
# ):
#     """
#     Main chatbot endpoint.
#     Requires the user to be logged in (use your existing JWT auth).
#     """
#     if not request.question.strip():
#         raise HTTPException(status_code=400, detail="Question cannot be empty")
#     history = [{"role": msg.role, "content": msg.content} for msg in request.history]
#     try:
#         answer = get_chatbot_response(user_question=request.question, chat_history=history)
#         return ChatResponse(answer=answer)
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Chatbot error: {str(e)}")
    
# @router.get("/health")
# def chatbot_health():
#     """Simple check to confirm chatbot is running."""
#     return {"status": "ok", "message": "Workivo Chatbot is running"}