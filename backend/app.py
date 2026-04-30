"""
Samsara Mental Health Chatbot — API Server
===========================================
Run this AFTER seeding the database (python seed.py).

Usage:
    python app.py              # Start server on port 4000
    python app.py --port 8080  # Start on custom port
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
from src.config import Config, logger
from src.generate import generate_answer

# Validate configuration on startup
try:
    Config.validate()
    logger.info("✅ Configuration validated successfully.")
except ValueError as e:
    logger.error(f"Configuration error: {e}")

app = FastAPI(
    title="Samsara Mental Health Chatbot API",
    description="A compassionate AI-powered mental health support companion",
    version="1.0.0"
)

# CORS — frontend runs on port configured in .env
app.add_middleware(
    CORSMiddleware,
    allow_origins=[f"http://localhost:{Config.FRONTEND_PORT}", f"http://127.0.0.1:{Config.FRONTEND_PORT}"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Models ───────────────────────────────────────────────────────────────────

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


# ─── Endpoints ────────────────────────────────────────────────────────────────

@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        service="Samsara Mental Health Chatbot",
        version="1.0.0"
    )

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Process a chat message and return an AI-generated response."""
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
    import argparse
    import uvicorn

    parser = argparse.ArgumentParser(description="Samsara API Server")
    parser.add_argument("--port", type=int, default=4000, help="Port (default: 4000)")
    args = parser.parse_args()

    uvicorn.run("app:app", host="0.0.0.0", port=args.port, reload=True)
