// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  questions: `${API_URL}/api/questions/`,
  question: (id: number) => `${API_URL}/api/questions/${id}/`,
  updateQuestion: (id: number) => `${API_URL}/api/questions/${id}/update/`,
  deleteQuestion: (id: number) => `${API_URL}/api/questions/${id}/delete/`,
};
