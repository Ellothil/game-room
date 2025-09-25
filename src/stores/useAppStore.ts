import { create } from 'zustand';
import { Id } from '../../convex/_generated/dataModel';

interface AppState {
  currentRoomId: Id<"gameRooms"> | null;
  setCurrentRoomId: (roomId: Id<"gameRooms"> | null) => void;
  
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentRoomId: null,
  setCurrentRoomId: (roomId) => set({ currentRoomId: roomId }),
  
  showSettings: false,
  setShowSettings: (show) => set({ showSettings: show }),
}));
