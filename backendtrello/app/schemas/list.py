from pydantic import BaseModel
from uuid import UUID

class ListCreate(BaseModel):
    title: str
    position: int

class ListRead(BaseModel):
    id: UUID
    title: str
    position: int

    class Config:
        from_attributes = True
