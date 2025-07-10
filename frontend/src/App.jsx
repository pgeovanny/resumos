import React, { useState } from "react";

export default function App() {
  const [banca, setBanca] = useState("Cespe");
  const [nivel, setNivel] = useState("Médio");
  const [tom, setTom] = useState("Concursos");
  const [estilo, setEstilo] = useState("padrão");
  const [command, setCommand] = useState("esquematizar");
  const [text, setText] = useState("");
  const [questoesTexto, setQuestoesTexto] = useState("");
  const [questoesFile, setQuestoesFile] = useState(null);
  const [cargo, setCargo] = useState("");
  const [ano, setAno] = useState("");
  const [result, setResult] = useState("");

  const enviar = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("text", text);
    formData.append("command", command);
    formData.append("estilo_linguagem", estilo);
    formData.append("banca", banca);
    formData.append("nivel_dificuldade", nivel);
    formData.append("tom_linguagem", tom);
    formData.append("questoes_texto", questoesTexto);
    if (questoesFile) formData.append("questoes_file", questoesFile);
    formData.append("cargo", cargo);
    formData.append("ano", ano);

    const resp = await fetch("https://resumos.onrender.com/process", {
      method: "POST",
      body: formData,
    });
    const data = await resp.json();
    setResult(data.processed_text || JSON.stringify(data));
  };

  return (
    <form onSubmit={enviar} style={{padding: 20}}>
      <h1>Gabarite – Versão Legislação</h1>

      <label>Banca:</label>
      {["Cespe", "FGV", "FCC", "Verbena", "Outra"].map((b) => (
        <label key={b}>
          <input type="radio" value={b} checked={banca === b} onChange={() => setBanca(b)} />
          {b}
        </label>
      ))}
      <br />

      <label>Nível:</label>
      {["Fácil", "Médio", "Difícil"].map((n) => (
        <label key={n}>
          <input type="radio" value={n} checked={nivel === n} onChange={() => setNivel(n)} />
          {n}
        </label>
      ))}
      <br />

      <label>Tom:</label>
      {["Técnico", "Didático", "Concursos", "Personalizado"].map((t) => (
        <label key={t}>
          <input type="radio" value={t} checked={tom === t} onChange={() => setTom(t)} />
          {t}
        </label>
      ))}
      <br />

      <label>Estilo de linguagem:</label>
      <input value={estilo} onChange={e => setEstilo(e.target.value)} /><br />

      <label>Comando para IA:</label>
      <input value={command} onChange={e => setCommand(e.target.value)} /><br />

      <label>Cargo:</label>
      <input value={cargo} onChange={e => setCargo(e.target.value)} /><br />

      <label>Ano:</label>
      <input value={ano} onChange={e => setAno(e.target.value)} /><br />

      <label>Texto base:</label>
      <textarea value={text} onChange={e => setText(e.target.value)} /><br />

      <label>Questões da banca (texto):</label>
      <textarea value={questoesTexto} onChange={e => setQuestoesTexto(e.target.value)} /><br />

      <label>Ou arquivo de questões (.txt, .docx, .csv):</label>
      <input type="file" onChange={e => setQuestoesFile(e.target.files[0])} /><br />

      <button type="submit">Enviar para IA</button>

      <div>
        <b>Resultado:</b>
        <pre>{result}</pre>
      </div>
    </form>
  );
}
