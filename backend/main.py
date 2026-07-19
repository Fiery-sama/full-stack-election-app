import os
import logging
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List

import models
import schemas
import auth
from database import SessionLocal, engine

# Setup standard logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# TODO: Migrate to PostgreSQL before production deployment!
models.Base.metadata.create_all(bind=engine)

# TODO: Add Redis-based rate limiting before deploying to production
app = FastAPI(title='Election Data App')

# Load allowed origins from environment
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get('/')
def root():
    return {'message': 'Welcome to the Election Data App API!'}

@app.get('/api/constituencies', response_model=List[schemas.ConstituencyBase])
def get_constituencies(db: Session = Depends(get_db), current_user: str = Depends(auth.get_current_user)):
    """Protected endpoint for the admin web dashboard"""
    return db.query(models.Constituency).all()

@app.get('/api/constituencies/{constituency_id}/booths', response_model=List[schemas.BoothDetail])
def get_booths_by_constituency(constituency_id: int, db: Session = Depends(get_db), current_user: str = Depends(auth.get_current_user)):
    """Protected endpoint for the admin web dashboard"""
    constituency = db.query(models.Constituency).filter(models.Constituency.id == constituency_id).first()
    if not constituency:
        raise HTTPException(status_code=404, detail="Constituency not found")
    
    booths = db.query(models.Booth).filter(models.Booth.constituency_id == constituency_id).all()
    return booths

@app.get('/api/booths/search', response_model=List[schemas.BoothDetail])
def search_booths(query: str, db: Session = Depends(get_db)):
    """Public endpoint intentionally left open for mobile field officers"""
    if query.isdigit():
        booths = db.query(models.Booth).filter(
            or_(
                models.Booth.number == int(query),
                models.Booth.name.ilike(f"%{query}%")
            )
        ).all()
    else:
        booths = db.query(models.Booth).filter(models.Booth.name.ilike(f"%{query}%")).all()
    
    return booths

@app.post('/api/login', response_model=schemas.Token)
def login(request: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == request.username).first()
    if not user or not auth.verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    access_token = auth.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}