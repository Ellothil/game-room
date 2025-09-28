import { useEffect } from "react";
import type { GameRoom } from "shared/websocket/types";
import { toast } from "sonner";
import { LogoutButton } from "@/components/logout-button";
import { SettingsButton } from "@/components/settings-button";
import { useAuthStore } from "../../stores/auth-store";
import { useRoomStore } from "../../stores/room-store";
import { socket } from "../../websocket/socket";

function RoomList() {
  const rooms = useRoomStore((state) => state.rooms);
  const setRooms = useRoomStore((state) => state.setRooms);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    socket.connect();
    socket.emit("room:list");
    socket.on("room:list", (updatedRooms: GameRoom[]) => {
      setRooms(updatedRooms);
    });
    socket.on("room:join:error", (payload) => {
      toast.error(payload.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [setRooms]);

  const handleJoinRoom = (roomId: string) => {
    if (user) {
      socket.emit("room:join", roomId, user);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {rooms.map((room) => (
        <div
          className="flex flex-col justify-between rounded-lg border p-4"
          key={room.id}
        >
          <div>
            <h2 className="font-bold text-xl">{room.name}</h2>
            <p title={room.players.map((p) => p.username).join(", ")}>
              Players: {room.players.length} / {room.maxPlayers}
            </p>
          </div>
          <button
            className="mt-4 rounded-lg bg-primary px-3 py-2 hover:bg-primary/80"
            disabled={
              room.players.length >= room.maxPlayers ||
              room.players.some((p) => p.id === user?.id)
            }
            onClick={() => handleJoinRoom(room.id)}
            type="button"
          >
            Join Room
          </button>
        </div>
      ))}
    </div>
  );
}

export function Gallery() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="mx-16 flex h-screen w-full flex-col items-center justify-center pt-8">
      <header className="flex min-h-16 w-full items-center justify-between gap-4 border-b py-5">
        <h1 className="pl-4 font-bold text-3xl">Rooms</h1>
        <div className="flex gap-2">
          <SettingsButton />
          <LogoutButton />
        </div>
      </header>
      <main className="flex h-full w-full flex-col gap-4 p-8">
        <p className="text-center">Welcome {user?.username}!</p>
        <RoomList />
      </main>
    </div>
  );
}
