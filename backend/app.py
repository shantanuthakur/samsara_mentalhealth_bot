import sys
import os

# Ensure the backend directory is in the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
from src.config import Config, logger
from src.generate import generate_answer
from src.seed import run_pipeline

# Validate configuration on startup
try:
    Config.validate()
except ValueError as e:
    logger.error(f"Configuration error: {e}")

app = FastAPI(
    title="Samsara Mental Health Chatbot API",
    description="A compassionate AI-powered mental health support companion",
    version="1.0.0"
)

# CORS Configuration — frontend runs on port 3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Request / Response Models ────────────────────────────────────────────────

class UserProfile(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    age: int = Field(..., ge=10, le=120)
    gender: str = Field(..., min_length=1)


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    user_profile: Optional[UserProfile] = None
    conversation_history: Optional[list[dict]] = None


class ChatResponse(BaseModel):
    response: str
    status: str = "success"


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str


class SeedResponse(BaseModel):
    status: str
    message: str


# ─── API Endpoints ────────────────────────────────────────────────────────────

@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        service="Samsara Mental Health Chatbot",
        version="1.0.0"
    )


@app.post("/api/seed", response_model=SeedResponse)
async def seed_database():
    """Seed the Qdrant database with chunks.json data."""
    try:
        data_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "chunks.json")
        run_pipeline(data_path)
        return SeedResponse(status="success", message="Database seeded successfully with chunks.json data.")
    except Exception as e:
        logger.error(f"Seed endpoint error: {e}")
        raise HTTPException(status_code=500, detail=f"Seeding failed: {str(e)}")


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Process a chat message and return an AI-generated response.
    Supports user profile context and conversation history (last 8 messages).
    """
    try:
        user_profile_dict = None
        if request.user_profile:
            user_profile_dict = request.user_profile.model_dump()

        # Limit conversation history to last 8 messages
        history = request.conversation_history
        if history and len(history) > 8:
            history = history[-8:]

        response = generate_answer(
            query=request.message,
            user_profile=user_profile_dict,
            conversation_history=history
        )

        return ChatResponse(response=response)

    except Exception as e:
        logger.error(f"Chat endpoint error: {e}")
        raise HTTPException(
            status_code=500,
            detail="I'm having trouble processing your message. Please try again."
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=4000, reload=True)
