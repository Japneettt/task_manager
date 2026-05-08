from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def inbox():
    return {
        "assigned": [],
        "mentions": [],
        "due_soon": []
    }