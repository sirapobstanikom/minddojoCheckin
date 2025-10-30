const API_BASE = '/api'

function getToken() {
  try { return localStorage.getItem('auth_token') || '' } catch { return '' }
}

export async function apiFetch(path, options = {}) {
  const headers = new Headers(options.headers || {})
  headers.set('Content-Type', 'application/json')
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    let message = text
    try { const j = JSON.parse(text); message = j.message || text } catch {}
    throw new Error(message || `HTTP ${res.status}`)
  }
  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) return res.json()
  return res.text()
}

export const AuthApi = {
  login: (email, password) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
}

export const AttendanceApi = {
  checkIn: () => apiFetch('/attendance/checkin', { method: 'POST' }),
  checkOut: () => apiFetch('/attendance/checkout', { method: 'POST' }),
  today: () => apiFetch('/attendance/today', { method: 'GET' }),
  list: (month) => apiFetch(`/attendance${month ? `?month=${encodeURIComponent(month)}` : ''}`, { method: 'GET' }),
}

export const LeaveApi = {
  create: (payload) => apiFetch('/leave', { method: 'POST', body: JSON.stringify(payload) }),
  list: () => apiFetch('/leave', { method: 'GET' }),
  approve: (id) => apiFetch(`/leave/${id}/approve`, { method: 'PATCH' }),
  reject: (id) => apiFetch(`/leave/${id}/reject`, { method: 'PATCH' }),
}

export const ReportsApi = {
  summary: (month) => apiFetch(`/reports/summary${month ? `?month=${encodeURIComponent(month)}` : ''}`, { method: 'GET' }),
}


