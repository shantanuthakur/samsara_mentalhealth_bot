import argparse
from src.seed import run_pipeline
from src.generate import start_interactive_session

def main():
    parser = argparse.ArgumentParser(description="Professional RAG Assistant Engine")
    parser.add_argument("--seed", action="store_true", help="Run the data seeding process into Qdrant")
    parser.add_argument("--chat", action="store_true", help="Start the interactive RAG chat session")
    parser.add_argument("--data", default="data/chunks.json", help="Path to data JSON file to seed (default: data/chunks.json)")
    
    args = parser.parse_args()
    
    if args.seed:
        run_pipeline(args.data)
    elif args.chat:
        start_interactive_session()
    else:
        # Default behavior or help text
        parser.print_help()
        print("\nExample Usage:")
        print("  python main.py --seed                # to ingestion setup")
        print("  python main.py --chat                # start chatting")

if __name__ == "__main__":
    main()
