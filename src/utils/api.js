// utils/api.js
export const BACKEND_URL = "https://urban-winner-v65q4g4q7pp4cp99j-3001.app.github.dev";

export const apiFetch = async (path, options = {}) => {
  const token = localStorage.getItem("authToken");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers,
  });

  return response;
};
