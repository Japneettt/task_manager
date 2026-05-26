# from fastapi import WebSocket

# class ConnectionManager:
#     def __init__(self):
#         self.connections: dict[str, list[WebSocket]] = {}

#     async def connect(self, user_id: str, ws: WebSocket):
#         await ws.accept()

#         if user_id not in self.connections:
#             self.connections[user_id] = []

#         self.connections[user_id].append(ws)

#     def disconnect(self, user_id: str, ws: WebSocket):
#         if user_id in self.connections:
#             self.connections[user_id].remove(ws)

#     async def send(self, user_id: str, data: dict):
#         if user_id in self.connections:
#             for ws in self.connections[user_id]:
#                 await ws.send_json(data)


# # ✅ SINGLE INSTANCE (VERY IMPORTANT)
# manager = ConnectionManager()
from typing import Any
from fastapi import WebSocket
from fastapi.websockets import WebSocketDisconnect


class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str) -> None:
        await websocket.accept()
        self.active_connections.setdefault(user_id, []).append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: str) -> None:
        connections = self.active_connections.get(user_id)
        if not connections:
            return
        if websocket in connections:
            connections.remove(websocket)
        if not connections:
            self.active_connections.pop(user_id, None)

    async def send_to_user(self, user_id: str, message: dict[str, Any]) -> None:
        connections = list(self.active_connections.get(user_id, []))
        for connection in connections:
            try:
                await connection.send_json(message)
            except WebSocketDisconnect:
                self.disconnect(connection, user_id)
            except Exception:
                self.disconnect(connection, user_id)


manager = ConnectionManager()