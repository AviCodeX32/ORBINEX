from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.seed import seed_database

from app.api import opportunities, tracker, ai, admin, partner, user

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables and seed sample data
    Base.metadata.create_all(bind=engine)
    seed_database()
    yield

app = FastAPI(
    title=settings.APP_NAME,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health & Root Endpoints
@app.get("/")
def read_root():
    return {
        "platform": settings.APP_NAME,
        "tagline": "Discover -> Verify -> Personalize -> Act -> Learn",
        "version": settings.APP_VERSION,
        "status": "operational",
        "docs_url": "/docs",
        "api_v1_prefix": settings.API_V1_PREFIX
    }

@app.get("/api/v1/health")
def health_check():
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "ai_provider": settings.AI_PROVIDER,
        "database": "connected"
    }

# Include API v1 Subrouters
prefix = settings.API_V1_PREFIX
app.include_router(opportunities.router, prefix=prefix)
app.include_router(tracker.router, prefix=prefix)
app.include_router(ai.router, prefix=prefix)
app.include_router(admin.router, prefix=prefix)
app.include_router(partner.router, prefix=prefix)
app.include_router(user.router, prefix=prefix)
