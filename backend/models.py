from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Constituency(Base):
    __tablename__ = "constituencies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    total_voters = Column(Integer)
    
    booths = relationship("Booth", back_populates="constituency")

class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    party = Column(String)

class Booth(Base):
    __tablename__ = "booths"

    id = Column(Integer, primary_key=True, index=True)
    number = Column(Integer, index=True)
    name = Column(String)
    location_name = Column(String)
    total_voters = Column(Integer)
    constituency_id = Column(Integer, ForeignKey("constituencies.id"))

    constituency = relationship("Constituency", back_populates="booths")
    votes = relationship("BoothVote", back_populates="booth")

class BoothVote(Base):
    __tablename__ = "booth_votes"

    id = Column(Integer, primary_key=True, index=True)
    booth_id = Column(Integer, ForeignKey("booths.id"))
    candidate_id = Column(Integer, ForeignKey("candidates.id"))
    votes = Column(Integer)

    booth = relationship("Booth", back_populates="votes")
    candidate = relationship("Candidate")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
