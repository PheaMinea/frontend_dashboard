export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('access_token', token);
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('access_token');
};

export const removeAuthToken = () => {
  localStorage.removeItem('access_token');
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};