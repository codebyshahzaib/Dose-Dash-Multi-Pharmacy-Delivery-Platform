export const IMAGE_BASE = 'http://localhost:5000';
const API_BASE = `${IMAGE_BASE}/api`;


/**
 * Converts a stored fileUrl like "/uploads/prescriptions/rx-123.jpg"
 * into a secure API route: "http://localhost:5000/api/prescriptions/view/rx-123.jpg"
 */
export function secureFileUrl(fileUrl) {
  if (!fileUrl) return '';
  const filename = fileUrl.split('/').pop();
  return `${API_BASE}/prescriptions/view/${filename}`;
}

export async function apiRequest(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

export async function apiUpload(path, formData) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
    // Note: Do not set Content-Type header. The browser automatically sets it to multipart/form-data with the correct boundary when body is FormData.
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Upload failed');
  }

  return data;
}