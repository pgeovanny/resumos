import tempfile, os
from docx import Document
import pdfplumber

def extract_text_from_file(file, paginas=None):
    ext = os.path.splitext(file.filename)[1].lower()
    temp_file = tempfile.NamedTemporaryFile(delete=False)
    temp_file.write(file.file.read())
    temp_file.close()
    text = ""
    if ext == ".pdf":
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
    elif ext in [".docx", ".doc"]:
        doc = Document(temp_file.name)
        text = "\n".join([p.text for p in doc.paragraphs])
    else:
        text = ""
    os.unlink(temp_file.name)
    return text
