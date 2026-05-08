/**
 * Lightweight validation helpers.
 * No external dependency required.
 */

export function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validatePositiveNumber(val, label = 'Value') {
  const n = Number(val);
  if (isNaN(n) || n < 0) {
    return `${label} must be a non‑negative number.`;
  }
  return null;
}

export function validateRequired(obj, fields) {
  for (const f of fields) {
    if (obj[f] === undefined || obj[f] === null || obj[f] === '') {
      return `${f} is required.`;
    }
  }
  return null;
}

export function validateCoordinate(lat, lng) {
  if (lat !== undefined && lat !== null && lat !== '') {
    const la = Number(lat);
    if (isNaN(la) || la < -90 || la > 90) return 'Latitude must be between -90 and 90.';
  }
  if (lng !== undefined && lng !== null && lng !== '') {
    const lo = Number(lng);
    if (isNaN(lo) || lo < -180 || lo > 180) return 'Longitude must be between -180 and 180.';
  }
  return null;
}
