#!/bin/bash
echo "Setting up Second Brain Standalone System..."
# On Debian/Ubuntu: sudo apt-get install python3-pyaudio portaudio19-dev
pip install requests SpeechRecognition PyAudio
echo "Please ensure you have GROQ_API_KEY, OBSIDIAN_API_KEY and OBSIDIAN_API_URL set in your environment."
echo "Usage: python3 brain.py"
