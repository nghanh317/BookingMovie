import axiosClient from './axiosClient';

// ── News API ───────────────────────────────────────────────
export const newsApi = {
  getAll: (params = {}) => axiosClient.get('/api/v1/news', { params }),
  getById: (id) => axiosClient.get(`/api/v1/news/${id}`),
  create: (data) => axiosClient.post('/api/v1/news', data),
  update: (id, data) => axiosClient.put(`/api/v1/news/${id}`, data),
  delete: (id) => axiosClient.delete(`/api/v1/news/${id}`),
};

// ── Favorite API ───────────────────────────────────────────
export const favoriteApi = {
  getAll: (params = {}) => axiosClient.get('/api/v1/favorites', { params }),
  create: (data) => axiosClient.post('/api/v1/favorites', data),
};

// ── Review API ─────────────────────────────────────────────
export const reviewApi = {
  getAll: (params = {}) => axiosClient.get('/api/v1/reviews', { params }),
  create: (data) => axiosClient.post('/api/v1/reviews', data),
  update: (id, data) => axiosClient.put(`/api/v1/reviews/${id}`, data),
  delete: (id) => axiosClient.delete(`/api/v1/reviews/${id}`),
};

// ── MovieCinema API ────────────────────────────────────────
export const movieCinemaApi = {
  getAll: (params = {}) => axiosClient.get('/api/v1/movieCinemas', { params }),
};

// ── PromotionUsage API ─────────────────────────────────────
export const promotionUsageApi = {
  getAll: (params = {}) => axiosClient.get('/api/v1/promotionUsages', { params }),
  delete: (id) => axiosClient.delete(`/api/v1/promotionUsages/${id}`),
};

// ── SettingSystem API ──────────────────────────────────────
export const settingSystemApi = {
  getAll: (params = {}) => axiosClient.get('/api/v1/settingSystems', { params }),
  getById: (id) => axiosClient.get(`/api/v1/settingSystems/${id}`),
  create: (data) => axiosClient.post('/api/v1/settingSystems', data),
  getTicketPrice: () => axiosClient.get('/api/v1/settingSystems/price'),
  updateTicketPrice: (weekdayPrice, weekendPrice) =>
    axiosClient.put('/api/v1/settingSystems/price', { weekdayPrice, weekendPrice }),
};
