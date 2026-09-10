/**
 * UniPilot API Service Client
 * Connects the React frontend to the Python FastAPI backend.
 * Falls back gracefully to optimistic updates if the backend is temporarily offline.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const token = localStorage.getItem('unipilot_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Network request failed' }));
      throw new Error(err.detail || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.warn(`[UniPilot API] Request to ${endpoint} failed, falling back:`, error.message);
    throw error;
  }
}

export const api = {
  // Health
  checkHealth: () => request('/health').catch(() => ({ status: 'offline' })),

  // Attendance
  getAttendance: () => request('/attendance'),
  createSubject: (subject) =>
    request('/attendance', {
      method: 'POST',
      body: JSON.stringify(subject),
    }),
  deleteSubject: (subjectId) =>
    request(`/attendance/${subjectId}`, {
      method: 'DELETE',
    }),
  logAttendance: (subjectId, attendedDelta, heldDelta) =>
    request(`/attendance/${subjectId}/log`, {
      method: 'POST',
      body: JSON.stringify({ attended_delta: attendedDelta, held_delta: heldDelta }),
    }),
  bulkAttendance: (subjectId, status, days) =>
    request('/attendance/bulk', {
      method: 'POST',
      body: JSON.stringify({ subject_id: subjectId, status, days }),
    }),
  calculateWhatIf: (subjectId, targetPercentage) =>
    request('/attendance/calculate-whatif', {
      method: 'POST',
      body: JSON.stringify({ subject_id: subjectId, target_percentage: targetPercentage }),
    }),

  // Activities (Unified Feed)
  getActivities: (type) => request(`/activities${type && type !== 'All' ? `?type=${type}` : ''}`),
  addActivity: (item) =>
    request('/activities', {
      method: 'POST',
      body: JSON.stringify(item),
    }),
  deleteActivity: (id) =>
    request(`/activities/${id}`, {
      method: 'DELETE',
    }),

  // Importers
  importGitHub: (username) =>
    request('/import/github', {
      method: 'POST',
      body: JSON.stringify({ username }),
    }),
  commitGitHubRepo: (repo) =>
    request('/import/github/commit', {
      method: 'POST',
      body: JSON.stringify(repo),
    }),
  parseCertificate: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('unipilot_token');
    const res = await fetch(`${API_BASE}/import/certificate`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) throw new Error('Certificate extraction failed');
    return res.json();
  },
  commitCertificate: (cert) =>
    request('/import/certificate/commit', {
      method: 'POST',
      body: JSON.stringify(cert),
    }),

  chat: (message, history = []) =>
    request('/copilot/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    }),
  summarizeNotes: (docId) =>
    request(`/copilot/notes/${docId}/summarize`, {
      method: 'POST',
    }),
  getFlashcards: (docId) =>
    request(`/copilot/notes/${docId}/flashcards`),
  summarizeNotesAI: (docTitle, subject) =>
    request('/copilot/notes/summarize', {
      method: 'POST',
      body: JSON.stringify({ doc_title: docTitle, subject }),
    }),
  getFlashcardsAI: (docTitle, subject, count = 5) =>
    request('/copilot/notes/flashcards', {
      method: 'POST',
      body: JSON.stringify({ doc_title: docTitle, subject, count }),
    }),
  regenerateBullet: (bullet, context = '') =>
    request('/copilot/regenerate-bullet', {
      method: 'POST',
      body: JSON.stringify({ bullet, context }),
    }),

  // Resume & Portfolio
  compileResume: () => request('/resume/compile'),
  compilePortfolio: () => request('/resume/portfolio'),

  // Auth & Profile
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (name, email, password) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),
  getProfile: () => request('/auth/me'),
  updateProfile: (profileData) =>
    request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),
};
