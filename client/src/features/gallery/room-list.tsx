import { useAuthStore } from "@/stores/auth-store";
import { useRoomStore } from "@/stores/room-store";
import { socket } from "@/websocket/socket";

export function RoomList() {
  const rooms = useRoomStore((state) => state.rooms);
  const user = useAuthStore((state) => state.user);

  const handleJoinRoom = (roomId: string) => {
    if (user) {
      socket.emit("room:join", roomId, user);
    }
  };

  // Check if user is in any room
  const userInRoom = rooms.find((r) =>
    r.players.some((p) => p.id === user?.id)
  );

  return (
    <div className="grid grid-cols-1 gap-4">
      {rooms.map((room) => {
        const isUserInThisRoom = room.players.some((p) => p.id === user?.id);
        const isRoomFull = room.players.length >= room.maxPlayers;
        const isDisabled = isRoomFull || isUserInThisRoom;

        return (
          <div
            className="flex justify-between rounded-lg border p-4"
            key={room.id}
          >
            <h2 className="font-bold text-xl">{room.name}</h2>
            <div className="mt-2">
              <p className="font-semibold text-sm">
                ({room.players.length}/{room.maxPlayers}):
              </p>
              {room.players.length > 0 ? (
                <ul className="mt-1 list-inside list-disc text-sm">
                  {room.players.map((player) => (
                    <li key={player.id}>{player.username}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-muted-foreground text-sm">
                  No players yet
                </p>
              )}
            </div>
            <button
              className="mt-4 rounded-lg bg-primary px-3 py-2 hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isDisabled}
              onClick={() => handleJoinRoom(room.id)}
              type="button"
            >
              {(() => {
                if (isUserInThisRoom) {
                  return "Already Joined";
                }
                if (isRoomFull) {
                  return "Room Full";
                }
                if (userInRoom && !isUserInThisRoom) {
                  return "In Another Room";
                }
                return "Join Room";
              })()}
            </button>
          </div>
        );
      })}
    </div>
  );
}
