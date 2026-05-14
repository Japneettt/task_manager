from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class CardCreate(BaseModel):
    title: str
    description: Optional[str] = None

    assigned_to: Optional[str] = None   # ✅ EMAIL NOW (STRING)
    priority: Optional[str] = "Medium"
    due_date: Optional[datetime] = None


class CardRead(BaseModel):
    id: UUID
    title: str
    description: Optional[str]

    assigned_to: Optional[UUID]
    priority: Optional[str]
    due_date: Optional[datetime]

    class Config:
        from_attributes = True
