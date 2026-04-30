import os
import logging
from pathlib import Path
from dotenv import load_dotenv

# Load .env from project root (one level up from backend/)
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
if env_path.exists():
    load_dotenv(env_path)
else:
    # Fallback: try loading from current directory
    load_dotenv()

# Logging Configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class Config:
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    QDRANT_HOST = os.getenv("QDRANT_HOST", "localhost")
    QDRANT_PORT = int(os.getenv("QDRANT_PORT", "6333"))
    COLLECTION_NAME = os.getenv("COLLECTION_NAME", "rag_chunks")
    VECTOR_SIZE = int(os.getenv("VECTOR_SIZE", "1536"))
    EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
    LLM_MODEL = os.getenv("LLM_MODEL", "gpt-4o-mini")

    @classmethod
    def validate(cls):
        """Validates that all required configuration variables are present."""
        if not cls.OPENAI_API_KEY or cls.OPENAI_API_KEY == "your_openai_api_key_here":
            logger.error("OPENAI_API_KEY is not set correctly in environment variables.")
            raise ValueError("OPENAI_API_KEY is required. Please check your .env file.")
