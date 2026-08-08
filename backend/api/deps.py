from typing import Generator
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.config import settings
from backend.core.constants import JWT_ALGORITHM
from backend.core.exceptions import UnauthorizedException, ForbiddenException
from backend.models.user import User
from backend.schemas.auth import TokenData
from backend.core.enums import UserRole

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)

def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(reusable_oauth2)
) -> User:
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET, algorithms=[JWT_ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise UnauthorizedException()
    except JWTError:
        raise UnauthorizedException()
        
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise UnauthorizedException("User not found")
    if not user.is_active:
        raise UnauthorizedException("User is inactive")
    return user

class RoleChecker:
    def __init__(self, allowed_roles: list[UserRole]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in self.allowed_roles:
            raise ForbiddenException(f"Role {current_user.role} does not have access to this resource")
        return current_user

# Shortcuts
require_collector = RoleChecker([UserRole.COLLECTOR, UserRole.ADMIN])
require_responder = RoleChecker([UserRole.RESPONDER, UserRole.COLLECTOR, UserRole.ADMIN])
require_admin = RoleChecker([UserRole.ADMIN])
