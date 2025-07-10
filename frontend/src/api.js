export async function uploadPDF(formData) {
  return fetch('https://resumos.onrender.com/upload', {
    method: 'POST',
    body: formData,
  }).then(res => res.json());
}

export async function processText(formData) {
  return fetch('https://resumos.onrender.com/process', {
    method: 'POST',
    body: formData,
  }).then(res => res.json());
}
