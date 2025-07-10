import axios from "axios";

const API_URL = "https://resumos.onrender.com"; // seu backend FastAPI!

export const uploadFile = async (file, paginas) => {
  const formData = new FormData();
  formData.append("file", file);
  if (paginas) formData.append("paginas", paginas);
  return axios.post(`${API_URL}/upload`, formData);
};

export const processText = async (data) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value) formData.append(key, value);
  });
  return axios.post(`${API_URL}/process`, formData);
};

export const previewWord = async (processed_text) => {
  const formData = new FormData();
  formData.append("processed_text", processed_text);
  return axios.post(`${API_URL}/preview`, formData, {
    responseType: "blob"
  });
};

export const generateWord = async (processed_text) => {
  const formData = new FormData();
  formData.append("processed_text", processed_text);
  return axios.post(`${API_URL}/generate_word`, formData, {
    responseType: "blob"
  });
};
