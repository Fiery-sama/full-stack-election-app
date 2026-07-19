import random
from database import SessionLocal, engine, Base
import models

def seed_db():
    print("Creating tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    print("Generating Admin User...")
    import auth
    admin_user = models.User(
        username="admin",
        hashed_password=auth.get_password_hash("password123")
    )
    db.add(admin_user)
    db.commit()

    print("Generating Constituencies...")
    constituency_names = ["North District", "South District", "East District", "West District", "Central District"]
    constituencies = []
    
    for name in constituency_names:
        c = models.Constituency(name=name, total_voters=0)
        db.add(c)
        constituencies.append(c)
    db.commit()

    print("Generating Candidates...")
    parties = ["Party A", "Party B", "Party C", "Independent"]
    candidate_names = ["Mukesh Jha", "Dilip Kumar", "Yashpal Singh", "Iram Sheikh", "Suman Yadav"]
    candidates = []
    
    for i, name in enumerate(candidate_names):
        cand = models.Candidate(name=name, party=parties[i % len(parties)])
        db.add(cand)
        candidates.append(cand)
    db.commit()

    print("Generating Booths and Votes...")
    booth_number_counter = 1
    
    for constituency in constituencies:
        num_booths = random.randint(30, 50)
        constituency_total_voters = 0
        
        for _ in range(num_booths):
            booth_voters = random.randint(500, 1500)
            constituency_total_voters += booth_voters
            
            booth = models.Booth(
                number=booth_number_counter,
                name=f"Booth {booth_number_counter}",
                location_name=f"School {booth_number_counter}",
                total_voters=booth_voters,
                constituency_id=constituency.id
            )
            db.add(booth)
            db.commit() # commit to get booth ID
            
            booth_number_counter += 1

            # Generate votes for this booth (70-90% turnout)
            turnout_percentage = random.uniform(0.7, 0.9)
            total_votes_cast = int(booth_voters * turnout_percentage)
            
            votes_remaining = total_votes_cast
            
            # Distribute votes among candidates
            for i, cand in enumerate(candidates):
                if i == len(candidates) - 1:
                    votes_for_cand = votes_remaining
                else:
                    # random chunk of remaining votes
                    votes_for_cand = random.randint(0, int(votes_remaining * 0.6))
                    
                votes_remaining -= votes_for_cand
                
                bv = models.BoothVote(
                    booth_id=booth.id,
                    candidate_id=cand.id,
                    votes=votes_for_cand
                )
                db.add(bv)
        
        constituency.total_voters = constituency_total_voters
    
    db.commit()
    print("Database seeded successfully!")
    db.close()

if __name__ == "__main__":
    seed_db()
