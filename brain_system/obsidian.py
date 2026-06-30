import os
import requests

class ObsidianClient:
    def __init__(self):
        self.api_url = os.getenv("OBSIDIAN_API_URL", "http://127.0.0.1:27123")
        self.api_key = os.getenv("OBSIDIAN_API_KEY", "")

    def save_note(self, path, content, mode='overwrite'):
        if not self.api_key:
            return False, "Error: OBSIDIAN_API_KEY is not set."

        url = f"{self.api_url}/vault/{path}"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "text/markdown"
        }

        method = 'PUT'
        if mode == 'append': method = 'POST'

        try:
            response = requests.request(method, url, headers=headers, data=content)
            if response.status_code in [200, 201, 204]:
                return True, "Successfully saved to Obsidian."
            else:
                return False, f"Obsidian API returned {response.status_code}: {response.text}"
        except Exception as e:
            return False, f"Error connecting to Obsidian: {str(e)}"

    def get_active_file(self):
        url = f"{self.api_url}/active"
        headers = {"Authorization": f"Bearer {self.api_key}"}
        try:
            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                return response.json()
            return None
        except:
            return None
