# from fastapi import APIRouter, WebSocket, WebSocketDisconnect
# from app.websocket.manager import manager

# router = APIRouter()

# @router.websocket("/ws/activity/{user_id}")
# async def activity_ws(websocket: WebSocket, user_id: str):
#     await manager.connect(user_id, websocket)

#     try:
#         while True:
#             await websocket.receive_text()
#     except WebSocketDisconnect:
#         manager.disconnect(user_id, websocket)