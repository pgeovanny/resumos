from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from enum import Enum
import pdfplumber
import tempfile
import os
from docx import Document
import openai

from template_gabarite import (
    set_header_footer, set_styles, add_sumario, add_titulo, add_subtitulo, add_paragrafo, add_quadro, add_pag_break
)
from utils import (
    parse_indice_ia, add_indice_estatistico, parse_special_blocks
)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, restrinja!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "SUA_API_KEY_AQUI")

class Bancas(str, Enum):
    fgv = "FGV"
    cespe = "Cespe"
    fcc = "FCC"
    verbena = "Verbena"
    outra = "Outra"

class Niveis(str, Enum):
    facil = "Fácil"
    medio = "Médio"
    dificil = "Difícil"

class Tons(str, Enum):
    tecnico = "Técnico"
    didatico = "Didático"
    concurso = "Concursos"
    personalizado = "Personalizado"

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
    estilo_linguagem: str = Form(None),
    banca: Bancas = Form(...),
    nivel_dificuldade: Niveis = Form(None),
    tom_linguagem: Tons = Form(None),
    questoes_texto: str = Form(None),
    questoes_file: UploadFile = File(None),
    cargo: str = Form(None),
    ano: str = Form(None)
):
    openai.api_key = OPENAI_API_KEY
    questoes = questoes_texto or ""
    if questoes_file is not None:
        questoes += "\n" + extract_text_from_file(questoes_file)
    prompt = f"""
Você é um especialista em concursos.
Sua tarefa é "{command}" o conteúdo base abaixo.
Banca: {banca}
Nível de dificuldade: {nivel_dificuldade}
Tom de linguagem: {tom_linguagem}
Cargo: {cargo or '[não informado]'}, Ano: {ano or '[não informado]'}

Monte o seguinte quadro ANTES do conteúdo principal:

| Tópico | Subtópico | Qtd. Questões | % de Incidência |
| --- | --- | --- | --- |
| ... (um por linha, ordem decrescente) |

Depois do quadro, produza o material conforme instruções (esquematizado/resumido, incluindo as questões reais nos tópicos corretos, sempre explicando como o conteúdo cobre a resposta).
No final, gere 3 questões inéditas no padrão da banca.
Conteúdo base:
{text}
QUESTÕES DA BANCA:
{questoes}

Comando extra: {command}
Linguagem desejada: {estilo_linguagem}
"""
    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=4096
    )
    processed = response.choices[0].message.content
    return {"processed_text": processed}
