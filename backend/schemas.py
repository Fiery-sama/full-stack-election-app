from pydantic import BaseModel
from typing import List

class CandidateBase(BaseModel):
    id: int
    name: str
    party: str

    class Config:
        from_attributes = True

class BoothVoteBase(BaseModel):
    candidate: CandidateBase
    votes: int

    class Config:
        from_attributes = True

class BoothBase(BaseModel):
    id: int
    number: int
    name: str
    location_name: str
    total_voters: int
    constituency_id: int
    
    class Config:
        from_attributes = True

class BoothDetail(BoothBase):
    votes: List[BoothVoteBase] = []

    class Config:
        from_attributes = True

class ConstituencyBase(BaseModel):
    id: int
    name: str
    total_voters: int

    class Config:
        from_attributes = True

class ConstituencyDetail(ConstituencyBase):
    booths: List[BoothDetail] = []

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
