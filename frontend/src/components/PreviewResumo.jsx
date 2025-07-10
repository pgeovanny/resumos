// src/components/PreviewResumo.jsx
import React from "react";

export default function PreviewResumo({ resumo, onAprovar, onEditar }) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-3xl mx-auto mt-6">
      <div className="font-bold text-lg text-blue-700 mb-2">Pré-visualização do Material</div>
      <div className="prose max-w-none text-gray-800 whitespace-pre-line">
        {resumo || <span className="text-gray-400">Nada gerado ainda.</span>}
      </div>
      <div className="flex gap-4 mt-6 justify-end">
        <button
          onClick={onEditar}
          className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 font-semibold"
        >
          Voltar para editar
        </button>
        <button
          onClick={onAprovar}
          className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold"
        >
          Aprovar e exportar
        </button>
      </div>
    </div>
  );
}
