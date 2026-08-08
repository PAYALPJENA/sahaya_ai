from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.schemas.auth import Token, UserResponse, LoginRequest
from backend.services import auth_service
from backend.api import deps
from backend.models.user import User

router = APIRouter()

# Swagger-compatible login endpoint using OAuth2PasswordRequestForm
@router.post("/login", response_model=Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    # Form data has username and password. We map username to email.
    login_req = LoginRequest(email=form_data.username, password=form_data.password)
    return auth_service.authenticate_user(db, login_req)

# JSON-compatible login endpoint for client flexibility
@router.post("/login/json", response_model=Token)
def login_json(
    request: LoginRequest,
    db: Session = Depends(get_db)
):
    return auth_service.authenticate_user(db, request)

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(deps.get_current_user)):
    return current_user
