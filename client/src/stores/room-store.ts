import type { GameRoom } from "shared/websocket/types";
import { create } from "zustand";

type RoomState = {
  rooms: GameRoom[];
  setRooms: (rooms: GameRoom[]) => void;
  addRoom: (room: GameRoom) => void;
  removeRoom: (roomId: string) => void;
  updateRoom: (room: GameRoom) => void;
};

export const useRoomStore = create<RoomState>()((set) => ({
  rooms: [],
  setRooms: (rooms) => set({ rooms }),
  addRoom: (room) => set((state) => ({ rooms: [...state.rooms, room] })),
  removeRoom: (roomId) =>
    set((state) => ({
      rooms: state.rooms.filter((room) => room.id !== roomId),
    })),
  updateRoom: (room) =>
    set((state) => ({
      rooms: state.rooms.map((r) => (r.id === room.id ? room : r)),
    })),
}));
