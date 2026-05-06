/**
 * locationStore.js — Zustand store lưu tỉnh thành người dùng đã chọn
 * Dùng để share state giữa trang chủ và các luồng đặt vé
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useLocationStore = create(
  persist(
    (set) => ({
      selectedProvince: null, // null = chưa chọn / hiển thị tất cả

      setProvince: (province) => set({ selectedProvince: province }),
      clearProvince: () => set({ selectedProvince: null }),
    }),
    {
      name: 'cinema-location', // key trong localStorage
    }
  )
);

export default useLocationStore;
