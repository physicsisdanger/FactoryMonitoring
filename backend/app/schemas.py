from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List, Any

# User schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str
    invitation_code: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    created_at: datetime
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Zone schemas
class ZoneBase(BaseModel):
    name: str
    order: int = 0

class ZoneCreate(ZoneBase):
    pass

class ZoneUpdate(BaseModel):
    name: Optional[str] = None
    order: Optional[int] = None

class ZoneResponse(ZoneBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime
    machines: List['MachineResponse'] = []
    
    class Config:
        from_attributes = True

# Machine schemas
class MachineBase(BaseModel):
    name: str
    status: str = 'ready'
    temperature: float = 20.0
    position_x: int = 0
    position_y: int = 0
    position_w: int = 1
    position_h: int = 1

class MachineCreate(MachineBase):
    pass

class MachineUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    temperature: Optional[float] = None
    position_x: Optional[int] = None
    position_y: Optional[int] = None
    position_w: Optional[int] = None
    position_h: Optional[int] = None

class MachineResponse(MachineBase):
    id: int
    zone_id: int
    created_at: datetime
    updated_at: datetime
    history: List['MachineHistoryResponse'] = []
    photos: List['MachinePhotoResponse'] = []
    
    class Config:
        from_attributes = True

# History schemas
class HistoryPhotoBase(BaseModel):
    photo_url: str

class HistoryPhotoResponse(HistoryPhotoBase):
    id: int
    
    class Config:
        from_attributes = True

class HistoryCommentBase(BaseModel):
    text: str

class HistoryCommentCreate(HistoryCommentBase):
    photos: List[str] = []  # base64 photos

class HistoryCommentResponse(HistoryCommentBase):
    id: int
    user_id: int
    created_at: datetime
    user: UserResponse
    photos: List[HistoryPhotoResponse] = []
    
    class Config:
        from_attributes = True

class MachineHistoryBase(BaseModel):
    old_status: Optional[str] = None
    new_status: Optional[str] = None
    comment: Optional[str] = None

class MachineHistoryCreate(MachineHistoryBase):
    photos: List[str] = []  # base64 photos

class MachineHistoryResponse(MachineHistoryBase):
    id: int
    machine_id: int
    user_id: int
    created_at: datetime
    user: UserResponse
    photos: List[HistoryPhotoResponse] = []
    comments: List[HistoryCommentResponse] = []
    
    class Config:
        from_attributes = True

# Photo schemas
class MachinePhotoResponse(BaseModel):
    id: int
    photo_url: str
    uploaded_at: datetime
    
    class Config:
        from_attributes = True

# Activity schemas
class UserActivityResponse(BaseModel):
    id: int
    user_id: int
    action: str
    details: Optional[dict] = None
    created_at: datetime
    user: UserResponse
    
    class Config:
        from_attributes = True

# Invitation schemas
class InvitationCreate(BaseModel):
    expires_days: int = 7

class InvitationResponse(BaseModel):
    id: int
    code: str
    created_by: int
    used_by: Optional[int] = None
    used_at: Optional[datetime] = None
    created_at: datetime
    expires_at: datetime
    is_used: bool
    
    class Config:
        from_attributes = True

# WebSocket messages
class WSMessage(BaseModel):
    type: str  # 'zone_update', 'machine_update', 'status_change', 'history_add'
    data: Any
    user_id: int
    timestamp: datetime

# Update forward references
ZoneResponse.model_rebuild()
MachineResponse.model_rebuild()
MachineHistoryResponse.model_rebuild()