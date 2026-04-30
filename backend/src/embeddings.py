from openai import OpenAI
from src.config import Config, logger

# Initialize the OpenAI Client
try:
    if Config.OPENAI_API_KEY:
        client = OpenAI(api_key=Config.OPENAI_API_KEY)
    else:
        client = None
except Exception as e:
    logger.error(f"Failed to initialize OpenAI client: {e}")
    client = None

def get_embedding(text: str) -> list[float]:
    """
    Generates an embedding vector for the given text using OpenAI API.
    
    Args:
        text (str): The text to embed.
        
    Returns:
        list[float]: The generated embedding vector.
    """
    if not client:
        raise RuntimeError("OpenAI client is not initialized.")
    try:
        response = client.embeddings.create(
            model=Config.EMBEDDING_MODEL,
            input=text
        )
        return response.data[0].embedding
    except Exception as e:
        logger.error(f"Error generating embedding for text: '{text[:30]}...': {str(e)}")
        raise
