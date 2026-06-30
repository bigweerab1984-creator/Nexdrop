import speech_recognition as sr

class VoiceListener:
    def __init__(self):
        self.recognizer = sr.Recognizer()

    def listen(self):
        with sr.Microphone() as source:
            print("Listening...")
            self.recognizer.adjust_for_ambient_noise(source)
            audio = self.recognizer.listen(source)

        try:
            print("Recognizing...")
            text = self.recognizer.recognize_google(audio)
            return text
        except sr.UnknownValueError:
            return "Error: Could not understand audio"
        except sr.RequestError as e:
            return f"Error: Could not request results from Google Speech Recognition service; {e}"
        except Exception as e:
            return f"Error: {str(e)}"
