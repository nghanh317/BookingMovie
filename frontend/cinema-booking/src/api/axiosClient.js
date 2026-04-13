import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor: tự động gắn JWT token ──────────────
axiosClient.interceptors.request.use(
  (config) => {
    // Lấy token từ Zustand persist (localStorage)
    try {
      const authData = JSON.parse(localStorage.getItem('cinema-auth'));
      const token = authData?.state?.user?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // ignore parse error
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: xử lý lỗi chung ──────────────────
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, config } = error.response;
      const requestUrl = config?.url || '';

      // Bỏ qua redirect cho các endpoint công khai (auth, movies GET, ...)
      const isPublicEndpoint =
        requestUrl.includes('/api/v1/auth/') ||
        requestUrl.includes('/api/v1/movies');

      // Chỉ logout + redirect khi user ĐANG đăng nhập và token hết hạn
      if ((status === 401 || status === 403) && !isPublicEndpoint) {
        try {
          const authData = JSON.parse(localStorage.getItem('cinema-auth'));
          if (authData?.state?.user?.token) {
            localStorage.removeItem('cinema-auth');
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          }
        } catch (e) {
          // ignore
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
