# app/chatbot/vector_store.py

import chromadb
from sentence_transformers import SentenceTransformer
from app.chatbot.knowledge_base import WORKIVO_DOCS

# Load the free local embedding model (downloads once ~90MB, then cached)
# all-MiniLM-L6-v2 is fast, lightweight, runs on CPU, 100% free
print("🔄 Loading embedding model (first time may take ~30 seconds)...")
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
print("✅ Embedding model loaded!")

# ChromaDB stored locally in chroma_db/ folder
chroma_client = chromadb.PersistentClient(path="./chroma_db")

COLLECTION_NAME = "workivo_knowledge"


def get_embedding(text: str) -> list[float]:
    """Convert text to vector using local sentence-transformers model. Completely free."""
    # embedding = embedding_model.encode(text, convert_to_list=True)
    embedding = embedding_model.encode(text).tolist()
    return embedding


def initialize_vector_store():
    """
    Load all Workivo docs into ChromaDB on first run.
    Skips if already populated.
    """
    collection = chroma_client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"}
    )

    existing = collection.count()
    if existing >= len(WORKIVO_DOCS):
        print(f"✅ ChromaDB already has {existing} docs — skipping re-load")
        return collection

    print("🔄 Embedding knowledge base into ChromaDB...")

    for doc in WORKIVO_DOCS:
        existing_doc = collection.get(ids=[doc["id"]])
        if existing_doc["ids"]:
            continue

        embedding = get_embedding(doc["content"])

        collection.add(
            ids=[doc["id"]],
            embeddings=[embedding],
            documents=[doc["content"]],
            metadatas=[{"source": "workivo_docs"}]
        )

    print(f"✅ Loaded {len(WORKIVO_DOCS)} docs into ChromaDB")
    return collection


def search_similar_docs(query: str, n_results: int = 3) -> list[str]:
    """Find the most relevant docs for a user's question using local embeddings."""
    collection = chroma_client.get_collection(name=COLLECTION_NAME)

    query_embedding = get_embedding(query)

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results
    )

    return results["documents"][0] if results["documents"] else []