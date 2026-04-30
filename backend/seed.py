"""
Samsara — Database Seeder
==========================
Run this FIRST to seed the Qdrant vector database with mental health book chunks.

Usage:
    python seed.py
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.config import Config, logger
from src.database import get_qdrant_client, initialize_collection
from src.seed import load_data, seed_data

def main():
    print("Database Seeder")
    print("=" * 40)

    Config.validate()

    data_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "chunks.json")

    logger.info(f"Loading data from {data_path}...")
    data = load_data(data_path)
    logger.info(f"Loaded {len(data)} chunks.")

    logger.info("Connecting to Qdrant...")
    client = get_qdrant_client()
    initialize_collection(client)

    logger.info("Seeding data into Qdrant...")
    seed_data(data, client)

    print("=" * 40)
    print("Seeding complete! You can now run: python app.py")

if __name__ == "__main__":
    main()
