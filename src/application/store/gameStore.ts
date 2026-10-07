import { create } from 'zustand';

interface GameState {
  selectedLocationId: string | null;
  currentScene: 'map' | 'interior';
  setSelectedLocation: (id: string | null) => void;
  enterLocation: (id: string) => void;
  returnToMap: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  selectedLocationId: null,
  currentScene: 'map',
  setSelectedLocation: (id) => set({ selectedLocationId: id }),
  enterLocation: (id) => set({ selectedLocationId: id, currentScene: 'interior' }),
  returnToMap: () => set({ currentScene: 'map' }),
}));
