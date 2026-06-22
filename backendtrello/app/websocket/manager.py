
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
    # ✅ NEW: send the same message to a list of user_ids at once.
    # Used for team chat, where everyone on the team should see the
    # message live, not just one mentioned person.
    async def broadcast_to_users(
        self, user_ids: Iterable[str], message: dict[str, Any]
    ) -> None:
        for user_id in user_ids:
            await self.send_to_user(str(user_id), message)



manager = ConnectionManager()