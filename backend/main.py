from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import os

# Config IA Gemini
from services.ia_service import gerar_resumo_ia
from services.pdf_service import extract_text_from_file

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "SUA_CHAVE_GEMINI_AQUI")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    tipo: str = Form(...),   # "resumo" ou "questoes"
    paginas: str = Form(None)
):
    text = extract_text_from_file(file, paginas)
    return {"text": text}

@app.post("/process")
async def process_text(
    texto_base: str = Form(...),
    questoes_texto: str = Form(None),
    banca: str = Form(...),
    modo: str = Form(...),  # "resumo" ou "esquematizar"
):
    prompt = f"""
Você é um especialista em concursos públicos.
Banca: {banca}
Modo: {modo.upper()}
Texto base:
{texto_base}
QUESTÕES:
{questoes_texto or ''}

Instruções:
- {('Resuma' if modo=='resumo' else 'Esquematize')} o texto acima, criando quadros, tabelas, esquemas visuais e destaques.
- Siga o padrão da banca.
- Faça o conteúdo visual, estruturado e premium.
- Use linguagem clara, objetiva e didática.
"""
    try:
        resultado = gerar_resumo_ia(prompt)
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
    return {"processed_text": resultado}
