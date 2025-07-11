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

  // Arquivos e dados
  const [fileBase, setFileBase] = useState(null);
  const [fileQuestoes, setFileQuestoes] = useState(null);
  const [textBase, setTextBase] = useState("");
  const [questoesText, setQuestoesText] = useState("");
  const [banca, setBanca] = useState("");
  const [modo, setModo] = useState("resumo");
  const [preview, setPreview] = useState("");
  const [exportDialog, setExportDialog] = useState(false);

  // Step 1: Upload base PDF
  const handleFileBase = async (file) => {
    setFileBase(file);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("tipo", "resumo");
    const res = await uploadPDF(formData);
    setTextBase(res.text);
  };

  // Step 2: Upload questões
  const handleFileQuestoes = async (file) => {
    setFileQuestoes(file);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("tipo", "questoes");
    const res = await uploadPDF(formData);
    setQuestoesText(res.text);
  };

  // Step 3: Processar com IA
  const handleGerar = async () => {
    const formData = new FormData();
    formData.append("texto_base", textBase);
    formData.append("questoes_texto", questoesText);
    formData.append("banca", banca);
    formData.append("modo", modo);
    const res = await processText(formData);
    setPreview(res.processed_text);
    setStep(3);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-xl">
        <Stepper current={step} steps={steps} />

        {step === 0 && (
          <PDFUpload onChange={handleFileBase} filename={fileBase?.name} />
        )}
        {step === 0 && fileBase && (
          <button
            className="mt-6 bg-blue-700 text-white px-6 py-2 rounded-xl"
            onClick={() => setStep(1)}
          >
            Próximo
          </button>
        )}

        {step === 1 && (
          <>
            <QuestaoUpload
              onChange={handleFileQuestoes}
              filename={fileQuestoes?.name}
            />
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
            <div className="mb-6">
              <BancaSelect value={banca} onChange={setBanca} />
              <div className="flex gap-4 mt-3 justify-center">
                <label className="font-semibold">
                  <input
                    type="radio"
                    checked={modo === "resumo"}
                    onChange={() => setModo("resumo")}
                  />{" "}
                  Resumir
                </label>
                <label className="font-semibold">
                  <input
                    type="radio"
                    checked={modo === "esquematizar"}
                    onChange={() => setModo("esquematizar")}
                  />{" "}
                  Esquematizar
                </label>
              </div>
            </div>
            <button
              className="bg-blue-700 text-white px-6 py-2 rounded-xl"
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
          onConfirm={() =>
            alert("Exportação para Word/PDF Premium em desenvolvimento")
          }
          onCancel={() => setExportDialog(false)}
        />
      </div>
    </div>
  );
}
