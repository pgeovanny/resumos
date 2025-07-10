// src/components/BancaSelect.jsx
import React from "react";

const BANCAS = ["FGV", "Cespe", "FCC", "Verbena", "Outra"];

export default function BancaSelect({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-4 my-4 justify-center">
      {BANCAS.map(banca => (
        <button
          key={banca}
          type="button"
          className={`px-5 py-2 rounded-lg font-bold border-2 transition ${
            value === banca
              ? "border-blue-700 bg-blue-100 text-blue-900 shadow"
              : "border-gray-300 bg-white text-gray-600"
          }`}
          onClick={() => onChange(banca)}
        >
          {banca}
        </button>
      ))}
    </div>
  );
}
