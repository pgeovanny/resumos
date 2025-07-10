from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from enum import Enum
import tempfile
import os
import pdfplumber
from docx import Document
import google.generativeai as genai

# Configure a chave Gemini (adicione a variável de ambiente GOOGLE_API_KEY no Render)
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "SUA_CHAVE_GEMINI_AQUI")
genai.configure(api_key=GOOGLE_API_KEY)

app = FastAPI()

# Habilita CORS total
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Em produção, coloque o domínio do seu front!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enum para bancas
class Bancas(str, Enum):
    fgv = "FGV"
    cespe = "Cespe"
    fcc = "FCC"
    verbena = "Verbena"
    outra = "Outra"

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
    elif ext == ".csv":
        import pandas as pd
        df = pd.read_csv(temp_file.name, dtype=str)
        text = "\n".join([" | ".join(row) for row in df.values.tolist()])
    else:
        text = ""
    os.unlink(temp_file.name)
    return text

@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    paginas: str = Form(None)
):
    temp_file = tempfile.NamedTemporaryFile(delete=False)
    temp_file.write(await file.read())
    temp_file.close()
    ext = os.path.splitext(file.filename)[1]
    if ext.lower() == ".pdf":
        with pdfplumber.open(temp_file.name) as pdf:
            num_pages = len(pdf.pages)
            if paginas:
                page_idxs = []
                for bloco in paginas.split(','):
                    bloco = bloco.strip()
                    if '-' in bloco:
                        ini, fim = map(int, bloco.split('-'))
                        page_idxs.extend(list(range(ini-1, fim)))
                    else:
                        page_idxs.append(int(bloco)-1)
                page_idxs = [i for i in page_idxs if 0 <= i < num_pages]
                text = "\n".join([pdf.pages[i].extract_text() or "" for i in page_idxs])
            else:
                text = "\n".join([page.extract_text() or "" for page in pdf.pages])
    elif ext.lower() in [".docx", ".doc"]:
        doc = Document(temp_file.name)
        text = "\n".join([p.text for p in doc.paragraphs])
    else:
        os.unlink(temp_file.name)
        return JSONResponse({"error": "Formato não suportado"}, status_code=400)
    os.unlink(temp_file.name)
    return {"text": text}

@app.post("/process")
async def process_text(
    text: str = Form(...),
    command: str = Form("esquematizar"),
    estilo_linguagem: str = Form("técnico"),
    banca: Bancas = Form(...),
    questoes_texto: str = Form(""),
    questoes_file: UploadFile = File(None),
    cargo: str = Form(""),
    ano: str = Form(""),
    modo: str = Form("esquematizar"),  # ou "resumir"
    nivel: str = Form("Médio"),
    tom: str = Form("Didático")
):
    questoes = questoes_texto or ""
    if questoes_file is not None:
        questoes += "\n" + extract_text_from_file(questoes_file)

    prompt = f"""
Você é um especialista em concursos públicos.
Banca: {banca} | Nível: {nivel} | Tom: {tom} | Cargo: {cargo} | Ano: {ano}
Comando: {command}
Estilo de linguagem: {estilo_linguagem}
MODO: {modo}

Texto base:
{text}

Questões da banca (se houver):
{questoes}

# Instrução
Gere o material solicitado acima. Faça resumo ou esquematize conforme o comando.
"""
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        result = response.text
    except Exception as e:
        return JSONResponse({"error": f"Erro ao chamar Gemini: {e}"}, status_code=500)

    return {"processed_text": result}
