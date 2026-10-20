import { getInitData, setDemoInitData } from '../shared/telegram.js';
import { handleLocalRequest } from './localMock.js';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

class ApiError extends Error {
  constructor(detail, status) {
    super(typeof detail === 'string' ? detail : JSON.stringify(detail));
    this.status = status;
  }
}

async function request(path, { method = 'GET', body, params } = {}) {
  let initData = getInitData();
  if (!initData) {
    initData = setDemoInitData(100000001);
  }

  if (import.meta.env.VITE_STATIC_DEMO === 'true') {
    return handleLocalRequest(path, { method, body, params }, initData);
  }

  const url = new URL(BASE_URL + path, window.location.origin);
  for (const [key, value] of Object.entries(params || {})) {
    if (value !== undefined && value !== null) url.searchParams.append(key, value);
  }

  let response;
  try {
    response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: 'tma ' + initData },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    // When running on GitHub Pages without a local backend server, fall back to the local store.
    return handleLocalRequest(path, { method, body, params }, initData);
  }

  const contentType = response.headers.get('content-type') || '';
  if (response.status === 404 && !contentType.includes('application/json')) {
    return handleLocalRequest(path, { method, body, params }, initData);
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(error.detail || 'Ошибка ' + response.status, response.status);
  }
  return response.status === 204 ? null : response.json();
}

export function getCurrentUser() { return request('/auth/me'); }
export function getTaskCommittees() { return request('/task-committees'); }

// ---------- Tasks ----------

export function getTasks({ page = 0, size = 10, status, assignedTo, unassigned } = {}) {
  return request("/tasks", { params: { page, size, status, assignedTo, unassigned } });
}

export function getTask(taskId) {
  return request(`/tasks/${taskId}`);
}

export function createTask(payload) {
  return request("/tasks", { method: "POST", body: payload });
}

export function updateTask(taskId, payload) {
  return request(`/tasks/${taskId}`, { method: "PATCH", body: payload });
}

export function updateTaskStatus(taskId, status) {
  return request(`/tasks/${taskId}/status`, { method: "PATCH", body: { status } });
}

export function takeTask(taskId) {
  return request(`/tasks/${taskId}/take`, { method: "POST" });
}

export function deleteTask(taskId) {
  return request(`/tasks/${taskId}`, { method: "DELETE" });
}

// ---------- Users ----------

export function getUsers({ search, committeeId, includeSelf } = {}) {
  return request("/users/subordinates", { params: { search, committeeId, includeSelf } });
}
