from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def activity_feed():
    return []