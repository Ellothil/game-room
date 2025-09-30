import { LogoutButton } from "@/components/logout-button";
import { SettingsButton } from "@/components/settings-button";
import { useAuthStore } from "../../stores/auth-store";
import { useRoomStore } from "../../stores/room-store";
import { socket } from "../../websocket/socket";
import { Room } from "../room/room";

function RoomList() {
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
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {rooms.map((room) => {
        const isUserInThisRoom = room.players.some((p) => p.id === user?.id);
        const isRoomFull = room.players.length >= room.maxPlayers;
        const isDisabled = isRoomFull || isUserInThisRoom;

        return (
          <div
            className="flex flex-col justify-between rounded-lg border p-4"
            key={room.id}
          >
            <div>
              <h2 className="font-bold text-xl">{room.name}</h2>
              <div className="mt-2">
                <p className="font-semibold text-sm">
                  Players ({room.players.length}/{room.maxPlayers}):
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

export function Gallery() {
  const user = useAuthStore((state) => state.user);
  const currentRoom = useRoomStore((state) => state.currentRoom);
  const setCurrentRoom = useRoomStore((state) => state.setCurrentRoom);

  // If user is in a room, show the Room view
  if (currentRoom) {
    return (
      <Room
        onLeave={() => setCurrentRoom(null)}
        room={currentRoom}
      />
    );
  }

  // Otherwise, show the gallery
  return (
    <div className="mx-16 flex h-screen w-full flex-col items-center justify-center pt-8">
      <header className="flex min-h-16 w-full items-center justify-between gap-4 border-b py-5">
        <h1 className="pl-4 font-bold text-3xl">Game Rooms</h1>
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
