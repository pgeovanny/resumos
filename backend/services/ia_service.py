import google.generativeai as genai
import os

def gerar_resumo_ia(prompt: str, modelo: str = "gemini-1.5-flash"):
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "SUA_CHAVE_GEMINI_AQUI")
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel(modelo)
    response = model.generate_content(prompt)
    return response.text.strip()
