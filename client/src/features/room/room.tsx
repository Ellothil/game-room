import type { GameRoom } from "shared/websocket/types";
import { useAuthStore } from "../../stores/auth-store";
import { socket } from "../../websocket/socket";

type RoomProps = {
  room: GameRoom;
  onLeave: () => void;
};

export function Room({ room, onLeave }: RoomProps) {
  const user = useAuthStore((state) => state.user);

  const handleLeaveRoom = () => {
    socket.emit("room:leave", room.id);
    onLeave();
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="mb-4 font-bold text-3xl">{room.name}</h1>
      <div className="mb-4">
        <h2 className="font-semibold text-xl">Players in room:</h2>
        <ul className="list-inside list-disc">
          {room.players.map((player) => (
            <li
              className={player.id === user?.id ? "font-bold" : ""}
              key={player.id}
            >
              {player.username} {player.id === user?.id && "(You)"}
            </li>
          ))}
        </ul>
      </div>
      <button
        className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
        onClick={handleLeaveRoom}
        type="button"
      >
        Leave Room
      </button>
    </div>
  );
}
