from typing import Dict, Set
import asyncio
import json
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, Set[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        self.active_connections[user_id].add(websocket)
    
    def disconnect(self, websocket: WebSocket, user_id: int):
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
    
    async def broadcast_to_all(self, message: dict):
        """Отправить сообщение всем подключенным пользователям"""
        for user_connections in self.active_connections.values():
            for connection in user_connections:
                try:
                    await connection.send_json(message)
                except:
                    pass
    
    async def broadcast_to_user(self, user_id: int, message: dict):
        """Отправить сообщение конкретному пользователю"""
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except:
                    pass
    
    async def broadcast_to_zone(self, zone_id: int, message: dict):
        """Отправить сообщение всем, у кого есть доступ к зоне"""
        # Для простоты пока отправляем всем
        await self.broadcast_to_all(message)


manager = ConnectionManager()


# Вспомогательная функция для сохранения фото
async def save_photo(base64_data: str, path: str) -> str:
    """Сохраняет base64 фото на диск и возвращает URL"""
    import base64
    import os
    from datetime import datetime
    
    # Убираем префикс если есть
    if ',' in base64_data:
        base64_data = base64_data.split(',')[1]
    
    # Декодируем
    image_data = base64.b64decode(base64_data)
    
    # Создаем имя файла
    filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{path.replace('/', '_')}.jpg"
    filepath = os.path.join('uploads', filename)
    
    # Сохраняем
    os.makedirs('uploads', exist_ok=True)
    with open(filepath, 'wb') as f:
        f.write(image_data)
    
    # Возвращаем URL
    return f"/uploads/{filename}"
    