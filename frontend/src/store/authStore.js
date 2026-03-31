import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      
      setUser: (user) => set({ 
        user: user, 
        isAuthenticated: !!user 
      }),
      
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, isAuthenticated: false });
      },
      
      checkAuth: () => {
        const token = localStorage.getItem('token');
        if (token && !get().user) {
          // TODO: Validate token with backend
          set({ isAuthenticated: true });
        }
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;