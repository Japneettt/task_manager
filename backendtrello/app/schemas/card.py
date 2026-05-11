from pydantic import BaseModel
from uuid import UUID

class CardCreate(BaseModel):
    title: str
    description: str | None = None
    position: int

class CardRead(BaseModel):
    id: UUID
    title: str
    description: str | None
    position: int

    class Config:
        from_attributes = True
