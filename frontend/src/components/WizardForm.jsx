import React, { useState } from "react";
import { uploadFile, processText, previewWord, generateWord } from "../api";

const bancas = [
  "FGV", "Cespe", "FCC", "Verbena", "Outra"
];

export default function WizardForm() {
  const [step, setStep] = useState(1);
  const [pdfFile, setPdfFile] = useState(null);
  const [paginas, setPaginas] = useState("");
  const [conteudoBase, setConteudoBase] = useState("");
  const [command, setCommand] = useState("");
  const [estilo, setEstilo] = useState("");
  const [banca, setBanca] = useState("FGV");
  const [cargo, setCargo] = useState("");
  const [ano, setAno] = useState("");
  const [questoesText, setQuestoesText] = useState("");
  const [questoesFile, setQuestoesFile] = useState(null);

  const [processing, setProcessing] = useState(false);
  const [processedText, setProcessedText] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");

  // Passo 1: Upload PDF/Word
  const handleUpload = async () => {
    setProcessing(true);
    setError("");
    try {
      const resp = await uploadFile(pdfFile, paginas);
      setConteudoBase(resp.data.text);
      setStep(2);
    } catch (e) {
      setError("Erro ao enviar arquivo!");
    }
    setProcessing(false);
  };

  // Passo 2: Processamento com comandos e questões
  const handleProcess = async () => {
    setProcessing(true);
    setError("");
    try {
      const data = {
        text: conteudoBase,
        command,
        estilo_linguagem: estilo,
        banca,
        questoes_texto: questoesText,
        cargo,
        ano
      };
      if (questoesFile) data.questoes_file = questoesFile;
      const resp = await processText(data);
      setProcessedText(resp.data.processed_text);
      setStep(3);
    } catch (e) {
      setError("Erro ao processar texto!");
    }
    setProcessing(false);
  };

  // Passo 3: Preview Word
  const handlePreview = async () => {
    setProcessing(true);
    setError("");
    try {
      const resp = await previewWord(processedText);
      const url = URL.createObjectURL(resp.data);
      setPreviewUrl(url);
    } catch (e) {
      setError("Erro ao gerar prévia!");
    }
    setProcessing(false);
  };

  // Passo 4: Download Word Final
  const handleDownload = async () => {
    setProcessing(true);
    setError("");
    try {
      const resp = await generateWord(processedText);
      const url = window.URL.createObjectURL(resp.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = "gabarite_legislacao.docx";
      a.click();
    } catch (e) {
      setError("Erro ao exportar Word!");
    }
    setProcessing(false);
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white shadow rounded-lg p-8">
      <h1 className="text-2xl font-bold mb-6 text-blue-700 text-center">
        Gabarite – Versão Legislação
      </h1>
      {step === 1 && (
        <div>
          <label className="font-semibold">Upload PDF/Word:</label>
          <input type="file" accept=".pdf,.doc,.docx" onChange={e => setPdfFile(e.target.files[0])} className="block my-2" />
          <label className="font-semibold">Quais páginas resumir? (ex: 1-5,7)</label>
          <input type="text" value={paginas} onChange={e => setPaginas(e.target.value)} className="block my-2 border px-2 py-1" placeholder="Ex: 1-10,12" />
          <button onClick={handleUpload} disabled={!pdfFile || processing}
            className="bg-blue-700 text-white px-4 py-2 rounded mt-4">
            {processing ? "Enviando..." : "Avançar"}
          </button>
        </div>
      )}
      {step === 2 && (
        <div>
          <label className="font-semibold">Comando para IA (ex: resumir, esquematizar...):</label>
          <input type="text" value={command} onChange={e => setCommand(e.target.value)} className="block my-2 border px-2 py-1 w-full" />
          <label className="font-semibold">Estilo de linguagem:</label>
          <input type="text" value={estilo} onChange={e => setEstilo(e.target.value)} className="block my-2 border px-2 py-1 w-full" placeholder="Ex: Tom técnico, padrão concurso..." />
          <label className="font-semibold">Banca:</label>
          <select value={banca} onChange={e => setBanca(e.target.value)} className="block my-2 border px-2 py-1">
            {bancas.map(b => <option key={b}>{b}</option>)}
          </select>
          <label className="font-semibold">Cargo:</label>
          <input type="text" value={cargo} onChange={e => setCargo(e.target.value)} className="block my-2 border px-2 py-1 w-full" />
          <label className="font-semibold">Ano:</label>
          <input type="text" value={ano} onChange={e => setAno(e.target.value)} className="block my-2 border px-2 py-1 w-full" />
          <label className="font-semibold">Questões da banca (texto):</label>
          <textarea value={questoesText} onChange={e => setQuestoesText(e.target.value)} className="block my-2 border px-2 py-1 w-full" rows={4} />
          <label className="font-semibold">Ou arquivo de questões (.txt, .docx, .csv):</label>
          <input type="file" onChange={e => setQuestoesFile(e.target.files[0])} className="block my-2" />
          <button onClick={handleProcess} disabled={processing}
            className="bg-blue-700 text-white px-4 py-2 rounded mt-4">
            {processing ? "Processando..." : "Avançar"}
          </button>
        </div>
      )}
      {step === 3 && (
        <div>
          <h2 className="font-bold mb-2">Material Gerado!</h2>
          <textarea value={processedText} readOnly rows={10} className="block w-full border p-2 mb-4" />
          <button onClick={handlePreview} disabled={processing}
            className="bg-green-600 text-white px-4 py-2 rounded mr-2">
            {processing ? "Gerando prévia..." : "Pré-visualizar Word"}
          </button>
          {previewUrl && (
            <a href={previewUrl} target="_blank" rel="noopener noreferrer"
              className="text-blue-700 underline ml-4">Baixar Prévia</a>
          )}
          <button onClick={handleDownload} disabled={processing}
            className="bg-blue-700 text-white px-4 py-2 rounded mt-4 block">
            {processing ? "Exportando..." : "Exportar Word Final"}
          </button>
        </div>
      )}
      {error && (
        <div className="bg-red-100 text-red-700 p-2 rounded mt-4">{error}</div>
      )}
    </div>
  );
}
