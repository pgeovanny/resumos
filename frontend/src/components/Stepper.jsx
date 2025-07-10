// src/components/Stepper.jsx
import React from "react";

export default function Stepper({ current, steps }) {
  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((label, idx) => (
        <div key={idx} className="flex-1 flex items-center">
          <div className={`rounded-full w-8 h-8 flex items-center justify-center font-bold ${current === idx ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700'}`}>
            {idx + 1}
          </div>
          <div className="ml-2 mr-4 font-semibold">{label}</div>
          {idx !== steps.length - 1 && (
            <div className="flex-1 border-t-2 border-gray-300"></div>
          )}
        </div>
      ))}
    </div>
  );
}
