// src/App.jsx
import React, { useState } from "react";
import Stepper from "./components/Stepper";
import PDFUpload from "./components/PDFUpload";
import QuestaoUpload from "./components/QuestaoUpload";
import BancaSelect from "./components/BancaSelect";
import PreviewResumo from "./components/PreviewResumo";
import ConfirmDialog from "./components/ConfirmDialog";
import { uploadPDF, processText } from "./api";

const steps = [
  "1. Envie o PDF/Word da Lei ou Matéria",
  "2. Anexe arquivo de Questões (opcional)",
  "3. Escolha a banca e modo",
  "4. Pré-visualização",
  "5. Exportar",
];

export default function App() {
  const [step, setStep] = useState(0);
  const [fileBase, setFileBase] = useState(null);
  const [fileQuestoes, setFileQuestoes] = useState(null);
  const [textBase, setTextBase] = useState("");
  const [questoesText, setQuestoesText] = useState("");
  const [banca, setBanca] = useState("");
  const [modo, setModo] = useState("resumo");
  const [preview, setPreview] = useState("");
  const [exportDialog, setExportDialog] = useState(false);

  const handleFileBase = async (file) => {
    setFileBase(file);
    const form = new FormData();
    form.append("file", file);
    form.append("tipo", "resumo");
    const res = await uploadPDF(form);
    setTextBase(res.text);
  };

  const handleFileQuestoes = async (file) => {
    setFileQuestoes(file);
    const form = new FormData();
    form.append("file", file);
    form.append("tipo", "questoes");
    const res = await uploadPDF(form);
    setQuestoesText(res.text);
  };

  const handleGerar = async () => {
    const form = new FormData();
    form.append("texto_base", textBase);
    form.append("questoes_texto", questoesText);
    form.append("banca", banca);
    form.append("modo", modo);
    const res = await processText(form);
    setPreview(res.processed_text);
    setStep(3);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-xl">
        <Stepper current={step} steps={steps} />

        {step === 0 && (
          <>
            <PDFUpload onChange={handleFileBase} filename={fileBase?.name} />
            {fileBase && (
              <button
                className="mt-6 bg-blue-700 text-white px-6 py-2 rounded-xl"
                onClick={() => setStep(1)}
              >
                Próximo
              </button>
            )}
          </>
        )}

        {step === 1 && (
          <>
            <QuestaoUpload onChange={handleFileQuestoes} filename={fileQuestoes?.name} />
            <button
              className="mt-6 bg-blue-700 text-white px-6 py-2 rounded-xl"
              onClick={() => setStep(2)}
            >
              {fileQuestoes ? "Próximo" : "Pular"}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <BancaSelect value={banca} onChange={setBanca} />
            <div className="flex gap-4 mt-3 justify-center">
              <label>
                <input
                  type="radio"
                  checked={modo === "resumo"}
                  onChange={() => setModo("resumo")}
                />{" "}
                Resumir
              </label>
              <label>
                <input
                  type="radio"
                  checked={modo === "esquematizar"}
                  onChange={() => setModo("esquematizar")}
                />{" "}
                Esquematizar
              </label>
            </div>
            <button
              className="mt-6 bg-blue-700 text-white px-6 py-2 rounded-xl"
              onClick={handleGerar}
              disabled={!banca}
            >
              Gerar prévia
            </button>
          </>
        )}

        {step === 3 && (
          <PreviewResumo
            resumo={preview}
            onAprovar={() => setExportDialog(true)}
            onEditar={() => setStep(2)}
          />
        )}

        <ConfirmDialog
          open={exportDialog}
          onConfirm={() => alert("Exportação para Word/PDF Premium em desenvolvimento")}
          onCancel={() => setExportDialog(false)}
        />
      </div>
    </div>
  );
}
