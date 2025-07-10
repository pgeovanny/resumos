from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import pdfplumber
import tempfile
import os
from docx import Document
import google.generativeai as genai

# ATENÇÃO: Coloque sua chave Gemini aqui ou em variável de ambiente GEMINI_API_KEY
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "SUA_CHAVE_GEMINI_AQUI")

genai.configure(api_key=GEMINI_API_KEY)

app = FastAPI()

# Liberar CORS para seu frontend (ajuste se precisar)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Ideal: ["https://SEU-FRONTEND.com"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def chamar_gemini(prompt, temperature=0.3, max_tokens=2048):
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content(
        prompt,
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
    estilo_linguagem: str = Form("padrão"),
    banca: str = Form("FGV"),
    nivel: str = Form("Médio"),
    tom: str = Form("Didático"),
    questoes_texto: str = Form(""),
    questoes_file: UploadFile = File(None),
    cargo: str = Form(""),
    ano: str = Form("")
):
    questoes = questoes_texto or ""
    if questoes_file is not None:
        questoes += "\n" + extract_text_from_file(questoes_file)
    prompt = f"""
Você é um especialista em concursos públicos.
Banca: {banca} | Nível: {nivel} | Tom: {tom} | Cargo: {cargo} | Ano: {ano}
Comando: {command}
Estilo de linguagem: {estilo_linguagem}

Texto base:
{text}

Questões da banca (se houver):
{questoes}

# Instrução
Gere o material solicitado acima. Faça resumo ou esquematize conforme o comando.
"""
    try:
        processed = chamar_gemini(prompt)
    except Exception as e:
        return JSONResponse({"error": f"Erro ao chamar Gemini: {str(e)}"}, status_code=500)
    return {"processed_text": processed}

# Se quiser, adicione endpoint para download, etc.
