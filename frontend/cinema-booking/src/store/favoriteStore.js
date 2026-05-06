import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useFavoriteStore = create(
  persist(
    (set, get) => ({
      favorites: [], // Array of movie IDs
      toggleFavorite: (movieId) => set((state) => {
        if (state.favorites.includes(movieId)) {
          return { favorites: state.favorites.filter(id => id !== movieId) };
        } else {
          return { favorites: [...state.favorites, movieId] };
        }
      }),
      isFavorite: (movieId) => get().favorites.includes(movieId),
    }),
    {
      name: 'cinema-favorites-storage',
    }
  )
);

export default useFavoriteStore;
