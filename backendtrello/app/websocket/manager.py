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