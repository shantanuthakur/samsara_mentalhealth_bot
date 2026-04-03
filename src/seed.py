import os
import json
from tqdm import tqdm
from qdrant_client.models import PointStruct

from src.config import Config, logger
from src.database import get_qdrant_client, initialize_collection
from src.embeddings import get_embedding

def load_data(path: str) -> list[dict]:
    """Loads dataset from a JSON file."""
    if not os.path.exists(path):
        logger.error(f"Data file not found at {path}")
        raise FileNotFoundError(f"Data file not found at {path}")
    
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def seed_data(data: list[dict], client):
    """Embeds textual data and inserts it into Qdrant in batches."""
    logger.info(f"Starting data seeding process for {len(data)} items...")
    points = []
    
    for idx, item in enumerate(tqdm(data, desc="Embedding and Indexing data")):
        text = item.get("text", "")
        if not text:
            # Skip empty text
            continue
            
        try:
            embedding = get_embedding(text)
        except Exception as e:
            logger.warning(f"Failed to embed item {idx}. Error: {e}. Skipping.")
            continue
            
        point = PointStruct(
            id=idx,
            vector=embedding,
            payload={
                "text": text,
                "page": item.get("page", 0),
                "source": item.get("source", "Unknown")
            }
        )
        points.append(point)
        
        # Batch insert every 50 vectors to optimize network/database performance
        if len(points) >= 50:
            client.upsert(
                collection_name=Config.COLLECTION_NAME,
                points=points
            )
            points = []
            
    # Insert any remaining points
    if points:
        client.upsert(
            collection_name=Config.COLLECTION_NAME,
            points=points
        )
    logger.info("Seeding completed successfully.")

def run_pipeline(data_path: str):
    """Executes the full data ingestion pipeline."""
    Config.validate()
    try:
        data = load_data(data_path)
        client = get_qdrant_client()
        initialize_collection(client)
        seed_data(data, client)
    except Exception as e:
        logger.error(f"Pipeline failed: {e}")
        raise

if __name__ == "__main__":
    # Specify default path assuming execution from project root
    run_pipeline("data/chunks.json")
