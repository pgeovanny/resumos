// src/api.js
const BASE_URL = "https://resumos.onrender.com";

export async function uploadPDF(formData) {
  // formData deve conter: file: File
  const resp = await fetch(`${BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  });
  if (!resp.ok) {
    const err = await resp.json();
    throw new Error(err.error || resp.statusText);
  }
  return resp.json(); // { text: "..." }
}

export async function processText(formData) {
  // formData deve conter: text, banca, modo
  const resp = await fetch(`${BASE_URL}/process`, {
    method: "POST",
    body: formData,
  });
  if (!resp.ok) {
    const err = await resp.json();
    throw new Error(err.error || resp.statusText);
  }
  return resp.json(); // { processed_text: "..." }
}
