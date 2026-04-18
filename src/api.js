const API_URL = 'https://fourgame-api.onrender.com/api';

function getToken() { return localStorage.getItem('token'); }

async function request(endpoint, options = {}) {
  const token = getToken();
  const config = {
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }), ...options.headers },
    ...options,
  };
  const res = await fetch(`${API_URL}${endpoint}`, config);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export const api = {
  // Auth
  register: (username, password, email) => request('/auth/register', { method: 'POST', body: JSON.stringify({ username, password, email }) }),
  login: (username, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  getMe: () => request('/auth/me'),
  changePassword: (oldPassword, newPassword) => request('/auth/password', { method: 'PUT', body: JSON.stringify({ oldPassword, newPassword }) }),
  updateAvatar: (color) => request('/auth/avatar', { method: 'PUT', body: JSON.stringify({ color }) }),
  updateEmail: (email) => request('/auth/email', { method: 'PUT', body: JSON.stringify({ email }) }),

  // Games
  getGames: (params = {}) => { const qs = new URLSearchParams(params).toString(); return request(`/games${qs ? '?' + qs : ''}`); },
  getGame: (id) => request(`/games/${id}`),
  getGenres: () => request('/games/genres'),

  // Favorites
  getFavorites: () => request('/favorites'),
  getFavoriteIds: () => request('/favorites/ids'),
  addFavorite: (gameId) => request(`/favorites/${gameId}`, { method: 'POST' }),
  removeFavorite: (gameId) => request(`/favorites/${gameId}`, { method: 'DELETE' }),

  // Cart
  getCart: () => request('/cart'),
  getCartIds: () => request('/cart/ids'),
  addToCart: (gameId) => request(`/cart/${gameId}`, { method: 'POST' }),
  removeFromCart: (gameId) => request(`/cart/${gameId}`, { method: 'DELETE' }),
  clearCart: () => request('/cart', { method: 'DELETE' }),

  // Orders
  checkout: () => request('/orders/checkout', { method: 'POST' }),
  getOrders: () => request('/orders'),
  getOrder: (id) => request(`/orders/${id}`),

  // Support Tickets
  createTicket: (subject, message) => request('/tickets', { method: 'POST', body: JSON.stringify({ subject, message }) }),
  getTickets: () => request('/tickets'),
  getTicket: (id) => request(`/tickets/${id}`),
  sendMessage: (ticketId, message) => request(`/tickets/${ticketId}/messages`, { method: 'POST', body: JSON.stringify({ message }) }),
  closeTicket: (ticketId) => request(`/tickets/${ticketId}/close`, { method: 'PUT' }),

  // Admin
  getStats: () => request('/admin/stats'),
  getUsers: () => request('/admin/users'),
  setUserRole: (userId, role) => request(`/admin/users/${userId}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  getAdminOrders: () => request('/admin/orders'),
};
