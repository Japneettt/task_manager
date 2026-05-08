from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_boards():
    return {"boards": []}

@router.post("/")
async def create_board():
    return {"message": "board created"}