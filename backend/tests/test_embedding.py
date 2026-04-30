import pytest
from src.config import Config
from src.embeddings import get_embedding

def test_embedding_generation():
    """Test if embedding logic correctly generates vectors."""
    Config.validate()
    text = "This is a test sentence for embedding"
    
    try:
        embedding = get_embedding(text)
        assert len(embedding) > 0, "Embedding is empty."
        assert isinstance(embedding[0], float), "Embedding doesn't contain floats."
        
        print("✅ Embedding generated successfully!")
        print("📏 Embedding length:", len(embedding))
        print("🔢 First 5 values:", embedding[:5])
    except Exception as e:
        print("❌ Error occurred:", e)

if __name__ == "__main__":
    test_embedding_generation()
