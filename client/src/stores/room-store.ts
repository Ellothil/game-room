import type { GameRoom } from "shared/websocket/types";
import { create } from "zustand";

type RoomState = {
  rooms: GameRoom[];
  currentRoom: GameRoom | null;
  setRooms: (rooms: GameRoom[]) => void;
  addRoom: (room: GameRoom) => void;
  removeRoom: (roomId: string) => void;
  updateRoom: (room: GameRoom) => void;
  setCurrentRoom: (room: GameRoom | null) => void;
};

export const useRoomStore = create<RoomState>()((set) => ({
  rooms: [],
  currentRoom: null,
  setRooms: (rooms) => set({ rooms }),
  addRoom: (room) => set((state) => ({ rooms: [...state.rooms, room] })),
  removeRoom: (roomId) =>
    set((state) => ({
      rooms: state.rooms.filter((room) => room.id !== roomId),
    })),
  updateRoom: (room) =>
    set((state) => ({
      rooms: state.rooms.map((r) => (r.id === room.id ? room : r)),
      // Update currentRoom if it's the room being updated
      currentRoom:
        state.currentRoom?.id === room.id ? room : state.currentRoom,
    })),
  setCurrentRoom: (room) => set({ currentRoom: room }),
}));
