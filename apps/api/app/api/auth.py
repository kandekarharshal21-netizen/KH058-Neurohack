from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, create_access_token, get_current_user
from app.schemas.schemas import UserLogin, TokenResponse
from app.models.models import User

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/login", response_model=TokenResponse)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    token = create_access_token({"sub": user.email, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "agency_id": user.agency_id
        }
    }

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    if not current_user:
        return {
            "id": "demo-admin-id",
            "email": "admin@kshetra.gov.in",
            "full_name": "Chief Emergency Officer",
            "role": "ADMIN",
            "agency_id": None
        }
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "agency_id": current_user.agency_id
    }
