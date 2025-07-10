from fastapi import FastAPI, File, UploadFile, Form, Request
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

# CORS para permitir frontend separado
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Coloque seu domínio em produção
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

# ... (mantenha o restante igual)

@app.post("/process")
async def process_text(
    text: str = Form(...),
    command: str = Form(...),
    estilo_linguagem: str = Form(None),
    banca: Bancas = Form(...),
    nivel_dificuldade: Niveis = Form(None),       # <--- Novo campo
    tom_linguagem: Tons = Form(None),             # <--- Novo campo
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
Analise as questões a seguir da banca {banca} ({cargo or '[não informado]'}, {ano or '[não informado]'}).
Monte o seguinte quadro ANTES do conteúdo principal:

| Tópico | Subtópico | Qtd. Questões | % de Incidência |
| --- | --- | --- | --- |
| ... (um por linha, ordem decrescente) |

Depois do quadro, produza o material conforme instruções (esquematizado, incluindo as questões reais nos tópicos corretos, sempre explicando como o conteúdo cobre a resposta).
No final, gere 3 questões inéditas no padrão da banca.
Conteúdo base:
{text}
QUESTÕES DA BANCA:
{questoes}

Comando extra: {command}
Nível de dificuldade: {nivel_dificuldade}
Tom de linguagem: {tom_linguagem}
Linguagem desejada: {estilo_linguagem}
"""
    # ... Resto igual
    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=4096
    )
    processed = response.choices[0].message.content
    return {"processed_text": processed}
