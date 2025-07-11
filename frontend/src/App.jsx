import React, { useState } from "react";
import Stepper from "./components/Stepper";
import PDFUpload from "./components/PDFUpload";
import QuestaoUpload from "./components/QuestaoUpload";
import BancaSelect from "./components/BancaSelect";
import PreviewResumo from "./components/PreviewResumo";
import ConfirmDialog from "./components/ConfirmDialog";
import { uploadPDF, processText } from "./api";

const steps = [
  "1. Envie o PDF da Lei/Matéria",
  "2. Anexe arquivo de Questões (opcional)",
  "3. Escolha banca e modo",
  "4. Pré-visualização",
  "5. Exportar",
];

export default function App() {
  const [step, setStep] = useState(0);

  // estados de upload e dados
  const [fileBase, setFileBase] = useState(null);
  const [textBase, setTextBase] = useState("");
  const [fileQuestoes, setFileQuestoes] = useState(null);
  const [questoesText, setQuestoesText] = useState("");
  const [banca, setBanca] = useState("");
  const [modo, setModo] = useState("resumir");
  const [preview, setPreview] = useState("");
  const [exportDialog, setExportDialog] = useState(false);

  // Step 1: upload do PDF principal
  const handleFileBase = async (file) => {
    setFileBase(file);
    const fd = new FormData();
    fd.append("file", file);
    const { text } = await uploadPDF(fd);
    setTextBase(text);
  };

  // Step 2: upload do PDF/arquivo de questões
  const handleFileQuestoes = async (file) => {
    setFileQuestoes(file);
    const fd = new FormData();
    fd.append("file", file);
    const { text } = await uploadPDF(fd);
    setQuestoesText(text);
  };

  // Step 3: gera a pré-visualização
  const handleGerar = async () => {
    const fd = new FormData();
    fd.append("text", textBase);
    if (questoesText) fd.append("questoes_texto", questoesText);
    fd.append("banca", banca);
    fd.append("modo", modo);
    const { processed_text } = await processText(fd);
    setPreview(processed_text);
    setStep(3);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-xl">
        <Stepper current={step} steps={steps} />

        {step === 0 && (
          <>
            <PDFUpload
              onChange={handleFileBase}
              filename={fileBase?.name}
            />
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
                    value="resumir"
                    checked={modo === "resumir"}
                    onChange={() => setModo("resumir")}
                  />{" "}
                  Resumir
                </label>
                <label className="font-semibold">
                  <input
                    type="radio"
                    value="esquematizar"
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
