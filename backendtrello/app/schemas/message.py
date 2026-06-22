from pydantic import BaseModel
from uuid import UUID
from typing import List, Optional
from datetime import datetime


class MessageCreate(BaseModel):
    content: str

class SenderInfo(BaseModel):
    id: UUID
    name: str
    avatar: Optional[str] = None

    class Config:
        from_attributes = True

class TeamMessageRead(BaseModel):
    id: UUID
    team_id: UUID
    content: str
    sender: SenderInfo
    mentioned_user_ids: List[UUID] = []
    created_at: datetime

    class Config:
        from_attributes = True

class CardCommentRead(BaseModel):
    id: UUID
    card_id: UUID
    content: str
    sender: SenderInfo
    mentioned_user_ids: List[UUID] = []
    created_at: datetime

    class Config:
        from_attributes = True