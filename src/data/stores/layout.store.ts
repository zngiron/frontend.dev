import { create } from 'zustand';

interface LayoutState {
  isMenuOpen: boolean;
}

interface LayoutActions {
  openMenu: () => void;
  closeMenu: () => void;
  toggleMenu: () => void;
}

export const useLayoutStore = create<LayoutState & LayoutActions>((set) => ({
  isMenuOpen: false,
  openMenu: () => set({ isMenuOpen: true }),
  closeMenu: () => set({ isMenuOpen: false }),
  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
}));
