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
  forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (token, newPassword) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, newPassword }) }),

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

  // Reviews
  getReviews: (gameId, sort = 'helpful') => request(`/reviews/game/${gameId}?sort=${sort}`),
  canReview: (gameId) => request(`/reviews/can-review/${gameId}`),
  createReview: (gameId, rating, text) => request('/reviews', { method: 'POST', body: JSON.stringify({ gameId, rating, text }) }),
  deleteReview: (id) => request(`/reviews/${id}`, { method: 'DELETE' }),
  voteReviewHelpful: (id) => request(`/reviews/${id}/helpful`, { method: 'POST' }),
  getMyReviews: () => request('/reviews/my'),

  // Wishlist
  getWishlist: () => request('/wishlist'),
  addWishlist: (gameId) => request(`/wishlist/${gameId}`, { method: 'POST' }),
  removeWishlist: (gameId) => request(`/wishlist/${gameId}`, { method: 'DELETE' }),
  toggleWishlistNotify: (gameId, notify) => request(`/wishlist/${gameId}/notify`, { method: 'PUT', body: JSON.stringify({ notify }) }),

  // Gamification
  getAchievements: () => request('/gamification/achievements'),
  getPlayerStats: () => request('/gamification/stats'),
  getReferral: () => request('/gamification/referral'),
  applyReferral: (code) => request('/gamification/referral/apply', { method: 'POST', body: JSON.stringify({ code }) }),
  subscribeNewsletter: (email) => request('/gamification/subscribe', { method: 'POST', body: JSON.stringify({ email }) }),
  getGifts: () => request('/gamification/gifts'),
  claimGift: (id) => request(`/gamification/gifts/${id}/claim`, { method: 'POST' }),
  exportData: () => request('/gamification/export-data'),
  // 2FA
  setup2FA: () => request('/gamification/2fa/setup', { method: 'POST' }),
  verify2FA: (code) => request('/gamification/2fa/verify', { method: 'POST', body: JSON.stringify({ code }) }),
  disable2FA: (code) => request('/gamification/2fa/disable', { method: 'POST', body: JSON.stringify({ code }) }),
  get2FAStatus: () => request('/gamification/2fa/status'),

  // Admin
  getStats: () => request('/admin/stats'),
  getUsers: () => request('/admin/users'),
  setUserRole: (userId, role) => request(`/admin/users/${userId}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  getAdminOrders: () => request('/admin/orders'),
};
