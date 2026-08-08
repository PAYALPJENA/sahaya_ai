from sqlalchemy.orm import Session
from backend.models.user import User
from backend.schemas.auth import LoginRequest, Token
from backend.core.security import verify_password, create_access_token, get_password_hash
from backend.core.exceptions import UnauthorizedException

def authenticate_user(db: Session, request: LoginRequest) -> Token:
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise UnauthorizedException("Invalid email or password")
    
    if not verify_password(request.password, user.password_hash):
        raise UnauthorizedException("Invalid email or password")
        
    if not user.is_active:
        raise UnauthorizedException("User account is disabled")
        
    access_token = create_access_token(subject=user.id)
    return Token(access_token=access_token, token_type="bearer")
