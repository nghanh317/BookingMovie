/**
 * chatbotService.js
 * Quản lý API AI Chatbot
 *
 * POST /api/v1/ai/chat — Gửi prompt và nhận phản hồi từ AI
 *
 * Body: { prompt: string }
 * Response: string (phản hồi từ AI)
 */
import api from './api';

const chatbotService = {
  /**
   * Gửi tin nhắn cho AI chatbot — POST /api/v1/ai/chat
   * @param {string} prompt - Câu hỏi/tin nhắn của người dùng
   * @returns {Promise<string>} Phản hồi từ AI
   */
  chat: async (prompt) => {
    const res = await api.post('/v1/ai/chat', { prompt });
    const data = res.data?.data || res.data;
    return data.response || data;
  },
};

export default chatbotService;
