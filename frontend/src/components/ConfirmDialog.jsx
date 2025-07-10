// src/components/ConfirmDialog.jsx
import React from "react";

export default function ConfirmDialog({ open, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full">
        <div className="font-bold text-lg mb-4">Deseja exportar este material?</div>
        <div className="flex gap-4 mt-6 justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 font-semibold"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 rounded-lg bg-blue-700 hover:bg-blue-900 text-white font-bold"
          >
            Exportar
          </button>
        </div>
      </div>
    </div>
  );
}
