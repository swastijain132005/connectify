import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,

      login: (user, token) => set({ user, token }),
      logout: () => {
        localStorage.removeItem("auth-storage");
        set({ user: null, token: null })}
    }),
    {
      name: "auth-storage", // key in localStorage


      version: 2,
      migrate: (persistedState, version) => {
        if (version < 2) {
          return { user: null ,token: null};
        }
        return persistedState;
      },
    }
  )
);


export const usePostStore = create((set) => ({
  posts: [],
  setPosts: (posts) => set({ posts }),
  addPost: (post) =>
    set((state) => ({ posts: [post, ...state.posts] })),
}));
