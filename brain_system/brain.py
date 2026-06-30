import sys
import os
from pathlib import Path

# Simple .env loader
def load_env():
    env_path = Path(__file__).parent.parent / '.env'
    if not env_path.exists():
        env_path = Path(__file__).parent.parent / '.env.local'

    if env_path.exists():
        with open(env_path) as f:
            for line in f:
                if line.strip() and not line.startswith('#'):
                    key, value = line.strip().split('=', 1)
                    os.environ[key] = value

load_env()

from engine import BrainEngine
from obsidian import ObsidianClient
# Voice might fail if dependencies are not installed in the environment, so we handle it gracefully
try:
    from voice import VoiceListener
    VOICE_AVAILABLE = True
except ImportError:
    VOICE_AVAILABLE = False

def main():
    engine = BrainEngine()
    obsidian = ObsidianClient()
    listener = VoiceListener() if VOICE_AVAILABLE else None

    messages = []

    print("=== Second Brain (Standalone CLI) ===")
    print("Commands: /voice, /save, /clear, /exit")
    print(f"Connected to Brain API: {engine.api_url}")

    while True:
        try:
            user_input = input("\nYou: ").strip()

            if user_input.lower() == '/exit':
                break
            elif user_input.lower() == '/clear':
                messages = []
                print("Conversation cleared.")
                continue
            elif user_input.lower() == '/voice':
                if not listener:
                    print("Voice recognition is not available (check dependencies).")
                    continue
                user_input = listener.listen()
                print(f"Recognized: {user_input}")
                if user_input.startswith("Error"):
                    continue
            elif user_input.lower() == '/save':
                if not messages:
                    print("Nothing to save.")
                    continue
                last_response = messages[-1]['content']
                title = input("Note title: ")
                if not title: title = "Brain Note"
                success, msg = obsidian.save_note(f"{title}.md", last_response)
                print(msg)
                continue

            if not user_input:
                continue

            messages.append({"role": "user", "content": user_input})

            print("\nBrain is thinking...")
            response = engine.chat(messages)
            print(f"\nBrain: {response}")

            messages.append({"role": "assistant", "content": response})

        except KeyboardInterrupt:
            break
        except Exception as e:
            print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    import sys
    if "--test" in sys.argv:
        print("Running system check...")
        engine = BrainEngine()
        obsidian = ObsidianClient()
        print(f"Brain API URL: {engine.api_url}")
        print(f"Password Set: {bool(os.getenv('BRAIN_PASSWORD'))}")
        print(f"Voice Available: {VOICE_AVAILABLE}")
        print("System check complete.")
    else:
        main()
