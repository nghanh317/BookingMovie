import axiosClient from './axiosClient';

const productApi = {
  /**
   * Lấy danh sách sản phẩm (bỏng, nước, combo...)
   * GET /api/v1/products?page=0&size=50
   * Response: Page<ProductDTO> { id, productName, category, description, price, imageUrl }
   */
  getAll: (params = {}) => {
    return axiosClient.get('/api/v1/products', { params });
  },

  getById: (id) => axiosClient.get(`/api/v1/products/${id}`),
  create: (data) => axiosClient.post('/api/v1/products', data),
  update: (id, data) => axiosClient.put(`/api/v1/products/${id}`, data),
  delete: (id) => axiosClient.delete(`/api/v1/products/${id}`),
};

export default productApi;
