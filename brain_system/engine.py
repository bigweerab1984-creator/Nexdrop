import os
import requests
import json

class BrainEngine:
    def __init__(self):
        self.api_url = os.getenv("BRAIN_API_BASE_URL", "http://localhost:3000") + "/api/chat"
        self.password = os.getenv("BRAIN_PASSWORD", "")

    def chat(self, messages):
        headers = {
            "Authorization": f"Bearer {self.password}",
            "Content-Type": "application/json"
        }

        data = { "messages": messages }

        try:
            response = requests.post(self.api_url, headers=headers, json=data)
            response.raise_for_status()
            result = response.json()
            return result.get('content', 'No response content')
        except Exception as e:
            return f"Error connecting to Brain API: {str(e)}"
