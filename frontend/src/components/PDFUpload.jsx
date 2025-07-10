// src/components/PDFUpload.jsx
import React, { useRef } from "react";

export default function PDFUpload({ onChange, filename }) {
  const inputRef = useRef();

  return (
    <div className="my-8 flex flex-col items-center">
      <input
        type="file"
        accept=".pdf,.docx,.doc"
        style={{ display: "none" }}
        ref={inputRef}
        onChange={e => onChange(e.target.files[0])}
      />
      <button
        className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-xl hover:bg-blue-700 transition"
        onClick={() => inputRef.current.click()}
      >
        {filename ? "Trocar arquivo" : "Selecionar PDF/Word para resumir/esquematizar"}
      </button>
      {filename && (
        <div className="mt-3 text-gray-700 text-sm">
          <b>Arquivo selecionado:</b> {filename}
        </div>
      )}
    </div>
  );
}
