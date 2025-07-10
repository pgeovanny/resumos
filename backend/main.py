from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
import os
import tempfile
import pdfplumber
from docx import Document
import google.generativeai as genai

# CORS liberado para qualquer origem (ajuste depois se quiser segurança)
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "SUA_CHAVE_GEMINI_AQUI")
genai.configure(api_key=GOOGLE_API_KEY)

def chamar_gemini(prompt, temperature=0.3, max_tokens=2048):
    # Troque o modelo se necessário (faça o list_models se precisar)
    model = genai.GenerativeModel('gemini-1.5-pro-latest')
    response = model.generate_content(
        [prompt],
        generation_config={
            "temperature": temperature,
            "max_output_tokens": max_tokens
        }
    )
    return response.text.strip()

def extract_text_from_file(file: UploadFile):
    ext = os.path.splitext(file.filename)[1].lower()
    temp_file = tempfile.NamedTemporaryFile(delete=False)
    temp_file.write(file.file.read())
    temp_file.close()
    text = ""
    if ext == ".txt":
        with open(temp_file.name, encoding="utf-8") as f:
            text = f.read()
    elif ext in [".docx", ".doc"]:
        doc = Document(temp_file.name)
        text = "\n".join([p.text for p in doc.paragraphs])
    elif ext == ".pdf":
        with pdfplumber.open(temp_file.name) as pdf:
            text = "\n".join([p.extract_text() or "" for p in pdf.pages])
    else:
        text = ""
    os.unlink(temp_file.name)
    return text

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    text = extract_text_from_file(file)
    return {"text": text}

@app.post("/process")
async def process_text(
    text: str = Form(...),
    command: str = Form(...),
    banca: str = Form(""),
    questoes_texto: str = Form(""),
    cargo: str = Form(""),
    ano: str = Form("")
):
    prompt = f"""
Você é um especialista em concursos. Analise as questões da banca {banca} (Cargo: {cargo}, Ano: {ano}). Após análise, produza um resumo/esquematização conforme comando:
'{command}'
Conteúdo base:
{text}
QUESTÕES DA BANCA:
{questoes_texto}
"""
    try:
        processed = chamar_gemini(prompt)
        return {"processed_text": processed}
    except Exception as e:
        return JSONResponse({"error": f"Erro ao chamar Gemini: {e}"}, status_code=500)
