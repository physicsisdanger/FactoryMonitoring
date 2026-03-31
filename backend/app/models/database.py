from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, JSON, Boolean, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from datetime import datetime
import os

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100))
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime)
    invitation_code = Column(String(50), unique=True, nullable=True)
    invited_by = Column(Integer, ForeignKey('users.id'), nullable=True)
    
    # Relationships
    zones = relationship("Zone", back_populates="owner")
    activities = relationship("UserActivity", back_populates="user")
    invited_user = relationship("User", back_populates="inviter", remote_side=[id])
    inviter = relationship("User", back_populates="invited_user", remote_side=[id])

class Zone(Base):
    __tablename__ = 'zones'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    order = Column(Integer, default=0)
    owner_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    owner = relationship("User", back_populates="zones")
    machines = relationship("Machine", back_populates="zone", cascade="all, delete-orphan")

class Machine(Base):
    __tablename__ = 'machines'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    status = Column(String(50), default='ready')
    temperature = Column(Float, default=20.0)
    position_x = Column(Integer, default=0)
    position_y = Column(Integer, default=0)
    position_w = Column(Integer, default=1)
    position_h = Column(Integer, default=1)
    zone_id = Column(Integer, ForeignKey('zones.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    zone = relationship("Zone", back_populates="machines")
    history = relationship("MachineHistory", back_populates="machine", cascade="all, delete-orphan")
    photos = relationship("MachinePhoto", back_populates="machine", cascade="all, delete-orphan")

class MachineHistory(Base):
    __tablename__ = 'machine_history'
    
    id = Column(Integer, primary_key=True, index=True)
    machine_id = Column(Integer, ForeignKey('machines.id'), nullable=False)
    old_status = Column(String(50))
    new_status = Column(String(50))
    comment = Column(Text)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    machine = relationship("Machine", back_populates="history")
    user = relationship("User")
    photos = relationship("HistoryPhoto", back_populates="history", cascade="all, delete-orphan")
    comments = relationship("HistoryComment", back_populates="history", cascade="all, delete-orphan")

class HistoryComment(Base):
    __tablename__ = 'history_comments'
    
    id = Column(Integer, primary_key=True, index=True)
    history_id = Column(Integer, ForeignKey('machine_history.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    history = relationship("MachineHistory", back_populates="comments")
    user = relationship("User")
    photos = relationship("CommentPhoto", back_populates="comment", cascade="all, delete-orphan")

class MachinePhoto(Base):
    __tablename__ = 'machine_photos'
    
    id = Column(Integer, primary_key=True, index=True)
    machine_id = Column(Integer, ForeignKey('machines.id'), nullable=False)
    photo_url = Column(String(500), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    machine = relationship("Machine", back_populates="photos")

class HistoryPhoto(Base):
    __tablename__ = 'history_photos'
    
    id = Column(Integer, primary_key=True, index=True)
    history_id = Column(Integer, ForeignKey('machine_history.id'), nullable=False)
    photo_url = Column(String(500), nullable=False)
    
    # Relationships
    history = relationship("MachineHistory", back_populates="photos")

class CommentPhoto(Base):
    __tablename__ = 'comment_photos'
    
    id = Column(Integer, primary_key=True, index=True)
    comment_id = Column(Integer, ForeignKey('history_comments.id'), nullable=False)
    photo_url = Column(String(500), nullable=False)
    
    # Relationships
    comment = relationship("HistoryComment", back_populates="photos")

class UserActivity(Base):
    __tablename__ = 'user_activities'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    action = Column(String(100), nullable=False)
    details = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="activities")

class Invitation(Base):
    __tablename__ = 'invitations'
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False)
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    used_by = Column(Integer, ForeignKey('users.id'), nullable=True)
    used_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)
    is_used = Column(Boolean, default=False)