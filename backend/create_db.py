from backend.database import engine
from backend.models import Base

def init_db():
    print("Creating tables in database...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    init_db()
