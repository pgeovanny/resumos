from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from enum import Enum
import tempfile
import os
import pdfplumber
from docx import Document
import google.generativeai as genai

# CORS PARA QUALQUER ORIGEM
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Libera geral
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pegue sua chave Gemini no Render: Settings > Environment > GOOGLE_API_KEY
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "SUA_CHAVE_AQUI")
genai.configure(api_key=GOOGLE_API_KEY)

# Enum para bancas
class Bancas(str, Enum):
    fgv = "FGV"
    cespe = "Cespe"
    fcc = "FCC"
    verbena = "Verbena"
    outra = "Outra"

# Extrai texto de arquivos diversos
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
    command: str = Form(...),
    estilo_linguagem: str = Form("técnico"),
    banca: Bancas = Form(...),
    questoes_texto: str = Form(None),
    questoes_file: UploadFile = File(None),
    cargo: str = Form(None),
    ano: str = Form(None),
    modo: str = Form("resumir")   # Novo campo para resumir ou esquematizar
):
    # Junta questões do texto e arquivo se houver
    questoes = questoes_texto or ""
    if questoes_file is not None:
        questoes += "\n" + extract_text_from_file(questoes_file)

    # Monta prompt para Gemini
    prompt = f"""
Você é um especialista em concursos públicos.
Analise as questões da banca {banca} ({cargo or '[não informado]'}, {ano or '[não informado]'}).
Monte o seguinte quadro ANTES do conteúdo principal:

| Tópico | Subtópico | Qtd. Questões | % de Incidência |
| --- | --- | --- | --- |
| ... (um por linha, ordem decrescente) |

Depois do quadro, produza o material conforme instruções abaixo:

MODO DE GERAÇÃO: {modo.upper()}
Comando adicional: {command}
Linguagem: {estilo_linguagem}

Material base:
{text}

QUESTÕES DA BANCA:
{questoes}

Inclua exemplos, quadros, destaques (em cores), tabelas e questões inéditas no padrão da banca.
"""

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")  # Troque o modelo aqui se quiser
        response = model.generate_content(prompt)
        result = response.text
    except Exception as e:
        return JSONResponse({"error": f"Erro ao chamar Gemini: {e}"}, status_code=500)

    return {"processed_text": result}

# Você pode adicionar outras rotas para preview/exportação conforme o seu projeto!
