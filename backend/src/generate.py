from src.config import Config, logger
from src.retrieve import retrieve
from src.embeddings import client

# Mental health focused system prompt with safety guardrails
MENTAL_HEALTH_SYSTEM_PROMPT = """You are Samsara 🌿 — a compassionate, professional mental health support companion.

## Your Core Principles:
1. **Empathy First**: Always respond with warmth, validation, and genuine care.
2. **Evidence-Based**: Ground your responses in established counseling and psychology principles from your knowledge base.
3. **Safety**: NEVER provide medical diagnoses, prescribe medication, or replace professional therapy.
4. **Active Listening**: Reflect the user's emotions back to them. Use phrases like "It sounds like...", "I hear you...", "That must feel..."
5. **Encourage Professional Help**: When someone expresses severe distress, suicidal ideation, or crisis, always recommend professional resources.

## Response Style:
- Be warm, supportive, and non-judgmental
- Use a conversational yet professional tone
- Keep responses concise but meaningful (2-4 paragraphs max)
- Use gentle emojis sparingly (🌿, 💚, 🌱, ✨) to convey warmth
- Ask thoughtful follow-up questions to encourage self-reflection
- Validate emotions before offering guidance

## Safety Protocol:
If the user mentions self-harm, suicide, or danger to themselves or others, ALWAYS include:
- "If you're in crisis, please reach out to the **988 Suicide & Crisis Lifeline** (call or text 988)"
- "You can also text HOME to **741741** (Crisis Text Line)"
- "You are not alone, and help is available right now."

## When Greeting:
If the user sends a greeting (hi, hello, hey, etc.), respond warmly and ask how they're feeling today.
"""

GREETING_WORDS = {"hi", "hello", "hey", "hii", "hiii", "yo", "sup", "hola", "namaste", "good morning", "good evening", "good afternoon", "howdy", "greetings"}


def is_greeting(message: str) -> bool:
    """Check if the user's message is a simple greeting."""
    cleaned = message.strip().lower().rstrip("!.,?")
    return cleaned in GREETING_WORDS


def generate_greeting_response(user_name: str = "") -> str:
    """Generate a warm greeting response."""
    name_part = f" {user_name}" if user_name else ""
    return f"Hello{name_part}! 🌿 Welcome to Samsara. I'm here to listen and support you.\n\nHow are you feeling today? Take your time — there's no rush. 💚"


def generate_answer(query: str, user_profile: dict = None, conversation_history: list = None) -> str:
    """
    Generates an empathetic mental health response using RAG context.
    
    Args:
        query: The user's message.
        user_profile: Dict with name, age, gender.
        conversation_history: List of {"role": "user"/"assistant", "content": "..."} dicts.
        
    Returns:
        str: The generated response.
    """
    if not client:
        return "I'm having trouble connecting right now. Please try again in a moment. 🌿"

    # Handle greetings
    if is_greeting(query):
        name = user_profile.get("name", "") if user_profile else ""
        return generate_greeting_response(name)

    # Retrieve relevant context from Qdrant
    context_chunks = retrieve(query)
    
    context = "\n\n".join(context_chunks) if context_chunks else "No specific context available."
    
    # Build user context string
    user_context = ""
    if user_profile:
        parts = []
        if user_profile.get("name"):
            parts.append(f"Name: {user_profile['name']}")
        if user_profile.get("age"):
            parts.append(f"Age: {user_profile['age']}")
        if user_profile.get("gender"):
            parts.append(f"Gender: {user_profile['gender']}")
        if parts:
            user_context = f"\n\nUser Profile:\n" + ", ".join(parts)
    
    prompt = f"""
{user_context}

Relevant Knowledge Base Context:
{context}

User's Message:
{query}

Respond with empathy and professionalism. Use the context above to inform your response where relevant, but always maintain a supportive tone. If the context doesn't contain relevant information, use your general mental health knowledge to provide a compassionate response.
"""
    
    # Build messages list
    messages = [{"role": "system", "content": MENTAL_HEALTH_SYSTEM_PROMPT}]
    
    # Add conversation history (limit to last 10 messages for context window)
    if conversation_history:
        recent_history = conversation_history[-10:]
        messages.extend(recent_history)
    
    messages.append({"role": "user", "content": prompt})
    
    try:
        response = client.chat.completions.create(
            model=Config.LLM_MODEL,
            messages=messages,
            temperature=0.7,
            max_tokens=800
        )
        return response.choices[0].message.content or "I'm here for you. Could you tell me more about what you're experiencing? 🌿"
    except Exception as e:
        logger.error(f"Error during response generation: {e}")
        return "I'm having a moment of difficulty. Could you try sharing that again? I'm here to listen. 🌿"


def start_interactive_session():
    """Starts an interactive command-line session to chat with the RAG pipeline."""
    Config.validate()
    print("Welcome to the Professional RAG Chatbot. Type 'exit' or 'quit' to stop.")
    while True:
        try:
            query = input("\nAsk: ").strip()
            if query.lower() in ["exit", "quit", "q"]:
                break
            if not query:
                continue
                
            print("Thinking...")
            answer = generate_answer(query)
            print("\n🧠 Answer:\n", answer)
        except KeyboardInterrupt:
            print("\nExiting...")
            break
        except Exception as e:
            logger.error(f"Unexpected error: {e}")

if __name__ == "__main__":
    start_interactive_session()
