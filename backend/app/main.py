from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional, List
import jwt
from passlib.context import CryptContext

app = FastAPI(title="Factory Monitoring API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = "your-secret-key-change-in-production"
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# ========== МОДЕЛИ ==========
class UserRegister(BaseModel):
    username: str
    email: str
    full_name: Optional[str] = None
    password: str
    invitation_code: str

class UserLogin(BaseModel):
    username: str
    password: str

class InvitationCreate(BaseModel):
    expires_days: int = 7

class ZoneCreate(BaseModel):
    name: str
    order: int = 0

class ZoneUpdate(BaseModel):
    name: Optional[str] = None
    order: Optional[int] = None

class MachineCreate(BaseModel):
    name: str
    status: str = "ready"
    temperature: float = 20.0
    position_x: int = 0
    position_y: int = 0
    position_w: int = 1
    position_h: int = 1

class MachineUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    temperature: Optional[float] = None
    position_x: Optional[int] = None
    position_y: Optional[int] = None
    position_w: Optional[int] = None
    position_h: Optional[int] = None

# ========== ХРАНИЛИЩА ==========
users_db = {}
invitations_db = {}
zones_db = []

# ========== АДМИН ==========
users_db["admin"] = {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "full_name": "Administrator",
    "hashed_password": pwd_context.hash("admin123"),
    "is_active": True,
    "is_admin": True,
    "created_at": datetime.now()
}

# ========== ПРИГЛАШЕНИЕ ==========
invitations_db["test-invitation-123"] = {
    "code": "test-invitation-123",
    "created_by": 1,
    "expires_at": datetime.now() + timedelta(days=30),
    "is_used": False,
    "created_at": datetime.now()
}

# ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except:
        return None

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    username = payload.get("sub")
    user = users_db.get(username)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# ========== AUTH ENDPOINTS ==========
@app.post("/api/auth/register")
def register(user_data: UserRegister):
    invitation = invitations_db.get(user_data.invitation_code)
    if not invitation:
        raise HTTPException(status_code=400, detail="Invalid invitation code")
    if invitation["expires_at"] < datetime.now():
        raise HTTPException(status_code=400, detail="Invitation expired")
    if invitation["is_used"]:
        raise HTTPException(status_code=400, detail="Invitation already used")
    if user_data.username in users_db:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    users_db[user_data.username] = {
        "id": len(users_db) + 1,
        "username": user_data.username,
        "email": user_data.email,
        "full_name": user_data.full_name,
        "hashed_password": pwd_context.hash(user_data.password),
        "is_active": True,
        "is_admin": False,
        "created_at": datetime.now()
    }
    
    invitations_db[user_data.invitation_code]["is_used"] = True
    
    token = create_access_token({"sub": user_data.username})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": users_db[user_data.username]["id"],
            "username": user_data.username,
            "email": user_data.email,
            "full_name": user_data.full_name,
            "is_admin": False
        }
    }

@app.post("/api/auth/login")
def login(user_data: UserLogin):
    user = users_db.get(user_data.username)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not pwd_context.verify(user_data.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": user_data.username})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "full_name": user["full_name"],
            "is_admin": user["is_admin"]
        }
    }

@app.get("/api/auth/me")
def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user["id"],
        "username": current_user["username"],
        "email": current_user["email"],
        "full_name": current_user["full_name"],
        "is_admin": current_user["is_admin"]
    }

# ========== INVITATION ENDPOINTS ==========
@app.post("/api/invitations")
def create_invitation(
    invitation_data: InvitationCreate,
    current_user: dict = Depends(get_current_user)
):
    if not current_user["is_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    import secrets
    code = secrets.token_urlsafe(16)
    
    invitation = {
        "code": code,
        "created_by": current_user["id"],
        "expires_at": datetime.now() + timedelta(days=invitation_data.expires_days),
        "is_used": False,
        "created_at": datetime.now()
    }
    invitations_db[code] = invitation
    
    return invitation

@app.get("/api/invitations")
def get_invitations(current_user: dict = Depends(get_current_user)):
    if not current_user["is_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    return list(invitations_db.values())

# ========== ZONE ENDPOINTS ==========
@app.get("/api/zones")
def get_zones(current_user: dict = Depends(get_current_user)):
    return zones_db

@app.post("/api/zones")
def create_zone(zone_data: ZoneCreate, current_user: dict = Depends(get_current_user)):
    new_zone = {
        "id": len(zones_db) + 1,
        "name": zone_data.name,
        "order": zone_data.order,
        "machines": []
    }
    zones_db.append(new_zone)
    return new_zone

@app.put("/api/zones/{zone_id}")
def update_zone(zone_id: int, zone_data: ZoneUpdate, current_user: dict = Depends(get_current_user)):
    for zone in zones_db:
        if zone["id"] == zone_id:
            if zone_data.name is not None:
                zone["name"] = zone_data.name
            if zone_data.order is not None:
                zone["order"] = zone_data.order
            return zone
    raise HTTPException(status_code=404, detail="Zone not found")

@app.delete("/api/zones/{zone_id}")
def delete_zone(zone_id: int, current_user: dict = Depends(get_current_user)):
    for i, zone in enumerate(zones_db):
        if zone["id"] == zone_id:
            zones_db.pop(i)
            return {"message": "Zone deleted"}
    raise HTTPException(status_code=404, detail="Zone not found")

# ========== MACHINE ENDPOINTS ==========
@app.get("/api/zones/{zone_id}/machines")
def get_machines(zone_id: int, current_user: dict = Depends(get_current_user)):
    for zone in zones_db:
        if zone["id"] == zone_id:
            return zone.get("machines", [])
    raise HTTPException(status_code=404, detail="Zone not found")

@app.post("/api/zones/{zone_id}/machines")
def create_machine(zone_id: int, machine_data: MachineCreate, current_user: dict = Depends(get_current_user)):
    for zone in zones_db:
        if zone["id"] == zone_id:
            new_machine = {
                "id": len(zone.get("machines", [])) + 1,
                "name": machine_data.name,
                "status": machine_data.status,
                "temperature": machine_data.temperature,
                "position_x": machine_data.position_x,
                "position_y": machine_data.position_y,
                "position_w": machine_data.position_w,
                "position_h": machine_data.position_h,
                "history": []
            }
            if "machines" not in zone:
                zone["machines"] = []
            zone["machines"].append(new_machine)
            return new_machine
    raise HTTPException(status_code=404, detail="Zone not found")

@app.put("/api/machines/{machine_id}")
def update_machine(machine_id: int, machine_data: MachineUpdate, current_user: dict = Depends(get_current_user)):
    for zone in zones_db:
        for machine in zone.get("machines", []):
            if machine["id"] == machine_id:
                if machine_data.name is not None:
                    machine["name"] = machine_data.name
                if machine_data.status is not None:
                    machine["status"] = machine_data.status
                if machine_data.temperature is not None:
                    machine["temperature"] = machine_data.temperature
                if machine_data.position_x is not None:
                    machine["position_x"] = machine_data.position_x
                if machine_data.position_y is not None:
                    machine["position_y"] = machine_data.position_y
                if machine_data.position_w is not None:
                    machine["position_w"] = machine_data.position_w
                if machine_data.position_h is not None:
                    machine["position_h"] = machine_data.position_h
                return machine
    raise HTTPException(status_code=404, detail="Machine not found")

@app.delete("/api/machines/{machine_id}")
def delete_machine(machine_id: int, current_user: dict = Depends(get_current_user)):
    for zone in zones_db:
        for i, machine in enumerate(zone.get("machines", [])):
            if machine["id"] == machine_id:
                zone["machines"].pop(i)
                return {"message": "Machine deleted"}
    raise HTTPException(status_code=404, detail="Machine not found")

@app.post("/api/machines/{machine_id}/status")
def change_machine_status(
    machine_id: int, 
    status: str, 
    comment: str = "", 
    current_user: dict = Depends(get_current_user)
):
    for zone in zones_db:
        for machine in zone.get("machines", []):
            if machine["id"] == machine_id:
                old_status = machine["status"]
                machine["status"] = status
                
                history_entry = {
                    "id": len(machine.get("history", [])) + 1,
                    "old_status": old_status,
                    "new_status": status,
                    "comment": comment,
                    "created_at": datetime.now().isoformat(),
                    "user": current_user["username"]
                }
                
                if "history" not in machine:
                    machine["history"] = []
                machine["history"].insert(0, history_entry)
                
                return {"message": "Status updated", "history": history_entry}
    raise HTTPException(status_code=404, detail="Machine not found")

# ========== HEALTH ==========
@app.get("/")
def root():
    return {"message": "Factory Monitoring API is running"}

@app.get("/health")
def health():
    return {"status": "ok"}