export const API_BASE_URL = (
  process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'
).replace(/\/$/, '');

/**
 * Build a full image URL from a path like /uploads/testimonials/uuid.jpg
 * Returns a default placeholder if the path is falsy.
 */
export const getImageUrl = (path, placeholder = '/default-avatar.png') => {
  if (!path) return placeholder;

  const value = String(path).trim();

  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('blob:') ||
    value.startsWith('data:')
  ) {
    return value;
  }

  const normalizedPath = value
    .replace(/\\/g, '/')
    .replace(/^\/+/, '');

  return `${API_BASE_URL}/${normalizedPath}`;
};
