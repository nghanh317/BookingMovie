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

      // Danh sách endpoint công khai - không redirect khi lỗi 401/403
      const isPublicEndpoint =
        requestUrl.includes('/api/v1/auth/') ||
        requestUrl.includes('/api/v1/movies') ||
        requestUrl.includes('/api/v1/slots') ||
        requestUrl.includes('/api/v1/rooms') ||
        requestUrl.includes('/api/v1/cinemas') ||
        requestUrl.includes('/api/v1/provinces');

      // Chỉ logout + redirect khi token thực sự hết hạn (401)
      // KHÔNG logout khi 403 (thiếu quyền) vì admin vẫn đang đăng nhập hợp lệ
      if (status === 401 && !isPublicEndpoint) {
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
