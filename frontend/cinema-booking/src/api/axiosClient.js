import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// JWT thật luôn bắt đầu bằng "eyJ"
const isRealJWT = (token) => typeof token === 'string' && token.startsWith('eyJ');

// ── Request interceptor: tự động gắn JWT token ──────────────
axiosClient.interceptors.request.use(
  (config) => {
    try {
      const authData = JSON.parse(localStorage.getItem('cinema-auth'));
      const token = authData?.state?.token;
      if (token && isRealJWT(token)) {
        config.headers.Authorization = `Bearer ${token}`;
      } else if (token && !isRealJWT(token)) {
        console.warn('[axiosClient] Demo/invalid token detected and removed:', token);
        localStorage.removeItem('cinema-auth');
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
        requestUrl.includes('/api/v1/provinces') ||
        requestUrl.includes('/api/v1/promotions') || // Thêm các endpoint public khác
        requestUrl.includes('/api/v1/products');

      // Chỉ logout + redirect khi token thực sự hết hạn (401)
      // KHÔNG logout khi 403 (thiếu quyền) vì admin vẫn đang đăng nhập hợp lệ
      if (status === 401 && !isPublicEndpoint) {
        try {
          const authData = JSON.parse(localStorage.getItem('cinema-auth'));
          if (authData?.state?.token) {
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
