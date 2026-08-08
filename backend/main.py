from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
from backend.database import engine, Base, SessionLocal
from backend.api.v1.router import api_router
from backend.seed.seed_data import seed_baseline

# Initialize FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Sahaya AI - Human-in-the-Loop Disaster Response Operating System Backend",
    version="1.0.0"
)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def on_startup():
    print("[Lifespan] Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    
    if settings.SEED_ON_STARTUP:
        print("[Lifespan] Seeding initial data...")
        db = SessionLocal()
        try:
            seed_baseline(db)
        finally:
            db.close()
    print("[Lifespan] Server ready!")

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "service": settings.PROJECT_NAME}
