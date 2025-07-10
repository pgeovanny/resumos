// src/components/QuestaoUpload.jsx
import React, { useRef } from "react";

export default function QuestaoUpload({ onChange, filename }) {
  const inputRef = useRef();

  return (
    <div className="my-4 flex flex-col items-center">
      <input
        type="file"
        accept=".pdf,.docx,.doc,.csv,.txt"
        style={{ display: "none" }}
        ref={inputRef}
        onChange={e => onChange(e.target.files[0])}
      />
      <button
        className="bg-green-600 text-white px-6 py-2 rounded-xl shadow-lg hover:bg-green-700 transition"
        onClick={() => inputRef.current.click()}
      >
        {filename ? "Trocar arquivo de questões" : "Anexar arquivo com questões"}
      </button>
      {filename && (
        <div className="mt-2 text-gray-700 text-xs">
          <b>Questões:</b> {filename}
        </div>
      )}
    </div>
  );
}
