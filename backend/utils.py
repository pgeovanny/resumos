import re

def parse_indice_ia(processed_text: str):
    """
    Extrai a tabela índice do texto processado pela IA.
    Retorna uma lista de linhas.
    """
    indice = []
    padrao = r"\| *(.+?) *\| *(.+?) *\| *(.+?) *\| *(.+?) *\|"
    linhas = processed_text.splitlines()
    for linha in linhas:
        m = re.match(padrao, linha)
        if m and not "Tópico" in linha and not "---" in linha:
            indice.append([m.group(1).strip(), m.group(2).strip(), m.group(3).strip(), m.group(4).strip()])
    return indice if indice else None

def add_indice_estatistico(doc, indice_dados):
    if not indice_dados:
        return
    table = doc.add_table(rows=1, cols=4)
    hdr_cells = table.rows[0].cells
    for i, col in enumerate(["Tópico", "Subtópico", "Qtd. Questões", "% Incidência"]):
        hdr_cells[i].text = col
    for row in indice_dados:
        row_cells = table.add_row().cells
        for i, item in enumerate(row):
            row_cells[i].text = item

def parse_special_blocks(processed_text: str):
    """
    Identifica blocos especiais do texto da IA:
    - [QUADRO], [GRIFO categoria], [QUESTAO]
    Retorna lista de dicts: {type: texto/quadro/grifo/questao, content:..., categoria:...}
    """
    blocks = []
    lines = processed_text.splitlines()
    buffer, tipo, categoria = [], "texto", None
    for line in lines + [""]:
        if line.strip().lower().startswith("[quadro"):
            if buffer:
                blocks.append({"type": tipo, "content": "\n".join(buffer)})
                buffer = []
            tipo = "quadro"
            categoria = None
        elif "[grifo" in line.lower():
            if buffer:
                blocks.append({"type": tipo, "content": "\n".join(buffer), "categoria": categoria})
                buffer = []
            tipo = "grifo"
            m = re.search(r"\[grifo:? ?(.*?)\]", line, re.I)
            categoria = m.group(1) if m else "Padrao"
            buffer.append(line.replace(m.group(0), "") if m else line)
        elif "[questao" in line.lower() or "[questão" in line.lower():
            if buffer:
                blocks.append({"type": tipo, "content": "\n".join(buffer), "categoria": categoria})
                buffer = []
            tipo = "questao"
            categoria = None
        elif line.strip() == "":
            if buffer:
                blocks.append({"type": tipo, "content": "\n".join(buffer), "categoria": categoria})
                buffer, tipo, categoria = [], "texto", None
        else:
            buffer.append(line)
    return [b for b in blocks if b.get("content") and b["content"].strip()]
