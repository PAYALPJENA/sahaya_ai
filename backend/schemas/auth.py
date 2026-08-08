from pydantic import BaseModel, EmailStr
from typing import Optional
from backend.core.enums import UserRole

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[UserRole] = None
    user_id: Optional[int] = None

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: UserRole
    phone: Optional[str] = None
    designation: Optional[str] = None
    district: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True
