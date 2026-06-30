import os
import requests

class ObsidianClient:
    def __init__(self):
        self.api_url = os.getenv("BRAIN_API_BASE_URL", "http://localhost:3000") + "/api/obsidian"
        self.password = os.getenv("BRAIN_PASSWORD", "")

    def save_note(self, path, content, mode='overwrite'):
        headers = {
            "Authorization": f"Bearer {self.password}",
            "Content-Type": "application/json"
        }

        data = {
            "path": path,
            "content": content,
            "mode": mode
        }

        try:
            response = requests.post(self.api_url, headers=headers, json=data)
            if response.status_code == 200:
                return True, "Successfully saved to Obsidian via Brain API."
            else:
                return False, f"Brain API returned {response.status_code}: {response.text}"
        except Exception as e:
            return False, f"Error connecting to Brain API: {str(e)}"

    def get_active_file(self):
        headers = { "Authorization": f"Bearer {self.password}" }
        try:
            response = requests.get(self.api_url, headers=headers)
            if response.status_code == 200:
                return response.json()
            return None
        except:
            return None
