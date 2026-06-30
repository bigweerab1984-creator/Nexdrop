import os
import requests
import json

class BrainEngine:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        self.api_url = "https://api.groq.com/openai/v1/chat/completions"
        self.system_prompt = """You are the "Second Brain", a highly advanced AI assistant working in the background.
You excel at:
1. Solving complex multi-step problems.
2. Writing clean, efficient, and well-documented code in any language.
3. Thinking critically and providing deep insights.
4. Assisting the user in organizing their thoughts.

When writing code, always use triple backticks with the language specified.
Be concise but thorough. Focus on solving the user's specific problem accurately."""

    def chat(self, messages):
        if not self.api_key:
            return "Error: GROQ_API_KEY is not set. Please set it in your environment."

        full_messages = [{"role": "system", "content": self.system_prompt}] + messages

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        data = {
            "model": "llama-3.3-70b-versatile",
            "messages": full_messages,
            "temperature": 0.7,
            "max_tokens": 2048
        }

        try:
            response = requests.post(self.api_url, headers=headers, data=json.dumps(data))
            response.raise_for_status()
            result = response.json()
            return result['choices'][0]['message']['content']
        except Exception as e:
            return f"Error: {str(e)}"
