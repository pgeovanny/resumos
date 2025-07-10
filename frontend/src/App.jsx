import React, { useState } from "react";

export default function App() {
  const [acao, setAcao] = useState("esquematizar");
  const [banca, setBanca] = useState("Cespe");
  const [nivel, setNivel] = useState("Médio");
  const [tom, setTom] = useState("Concursos");
  const [estilo, setEstilo] = useState("padrão");
  const [command, setCommand] = useState("esquematizar");
  const [textFile, setTextFile] = useState(null); // NOVO: arquivo base
  const [paginas, setPaginas] = useState("");
  const [questoesTexto, setQuestoesTexto] = useState("");
  const [questoesFile, setQuestoesFile] = useState(null);
  const [cargo, setCargo] = useState("");
  const [ano, setAno] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. Upload do arquivo base (PDF/DOCX) para extrair texto!
  async function handleUploadArquivoBase(e) {
    const file = e.target.files[0];
    setTextFile(file);
  }

  async function extrairTextoBase() {
    if (!textFile) return "";
    const formData = new FormData();
    formData.append("file", textFile);
    formData.append("paginas", paginas);
    const resp = await fetch("https://resumos.onrender.com/upload", { method: "POST", body: formData });
    const data = await resp.json();
    return data.text || "";
  }

  // 2. Enviar tudo para a IA
  const enviar = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Pega texto do arquivo, se houver
    let textoBase = await extrairTextoBase();
    const formData = new FormData();
    formData.append("text", textoBase);
    formData.append("command", acao); // esquematizar ou resumir
    formData.append("estilo_linguagem", estilo);
    formData.append("banca", banca);
    formData.append("nivel_dificuldade", nivel);
    formData.append("tom_linguagem", tom);
    formData.append("questoes_texto", questoesTexto);
    if (questoesFile) formData.append("questoes_file", questoesFile);
    formData.append("cargo", cargo);
    formData.append("ano", ano);

    try {
      const resp = await fetch("https://resumos.onrender.com/process", {
        method: "POST",
        body: formData,
      });
      const data = await resp.json();
      setResult(data.processed_text || JSON.stringify(data));
    } catch (err) {
      setResult("Erro ao processar texto!");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={enviar} style={{ padding: 20 }}>
      <h1>Gabarite – Versão Legislação</h1>

      <div>
        <label>Ação:</label>
        <label>
          <input type="radio" value="resumir" checked={acao === "resumir"} onChange={() => setAcao("resumir")} />
          Resumir
        </label>
        <label>
          <input type="radio" value="esquematizar" checked={acao === "esquematizar"} onChange={() => setAcao("esquematizar")} />
          Esquematizar
        </label>
      </div>

      <div>
        <label>Arquivo base (.pdf, .docx):</label>
        <input type="file" accept=".pdf,.docx" onChange={handleUploadArquivoBase} />
        <span> (opcional: páginas ex: 1-5,7) </span>
        <input type="text" value={paginas} onChange={e => setPaginas(e.target.value)} placeholder="Quais páginas?" style={{width:100}}/>
      </div>

      <div>
        <label>Banca:</label>
        {["Cespe", "FGV", "FCC", "Verbena", "Outra"].map((b) => (
          <label key={b}>
            <input type="radio" value={b} checked={banca === b} onChange={() => setBanca(b)} />
            {b}
          </label>
        ))}
      </div>
      <div>
        <label>Nível:</label>
        {["Fácil", "Médio", "Difícil"].map((n) => (
          <label key={n}>
            <input type="radio" value={n} checked={nivel === n} onChange={() => setNivel(n)} />
            {n}
          </label>
        ))}
      </div>
      <div>
        <label>Tom:</label>
        {["Técnico", "Didático", "Concursos", "Personalizado"].map((t) => (
          <label key={t}>
            <input type="radio" value={t} checked={tom === t} onChange={() => setTom(t)} />
            {t}
          </label>
        ))}
      </div>
      <div>
        <label>Estilo de linguagem:</label>
        <input value={estilo} onChange={e => setEstilo(e.target.value)} />
      </div>
      <div>
        <label>Cargo:</label>
        <input value={cargo} onChange={e => setCargo(e.target.value)} />
      </div>
      <div>
        <label>Ano:</label>
        <input value={ano} onChange={e => setAno(e.target.value)} />
      </div>
      <div>
        <label>Questões da banca (texto):</label>
        <textarea value={questoesTexto} onChange={e => setQuestoesTexto(e.target.value)} />
      </div>
      <div>
        <label>Ou arquivo de questões (.txt, .docx, .csv):</label>
        <input type="file" onChange={e => setQuestoesFile(e.target.files[0])} />
      </div>
      <div>
        <button type="submit" disabled={loading}>{loading ? "Enviando..." : "Enviar para IA"}</button>
      </div>
      <div>
        <b>Resultado:</b>
        <pre>{result}</pre>
      </div>
    </form>
  );
}
