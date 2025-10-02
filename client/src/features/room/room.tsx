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

  const handleStartGame = () => {
    socket.emit("game:start", room.id);
  };

  const isRoomFull = room.players.length === room.maxPlayers;

  // Game master is the first player in the room
  const gameMaster = room.players[0];
  const isGameMaster = user?.id === gameMaster?.id;

  const getWaitingMessage = () => {
    if (!isRoomFull) {
      return `Waiting for ${room.maxPlayers - room.players.length} more player(s)...`;
    }

    if (isGameMaster) {
      return "All players ready! Start the game when ready.";
    }

    return "Waiting for game master to start the game...";
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        <header className="mb-8 text-center">
          <h1 className="mb-2 font-bold text-3xl">{room.name}</h1>
          <div className="flex items-center justify-center gap-4">
            <div className="rounded-lg bg-muted p-3">
              <h2 className="mb-2 font-semibold text-sm">Players:</h2>
              <ul className="space-y-1">
                {room.players.map((player, index) => (
                  <li
                    className={`text-sm ${player.id === user?.id ? "font-bold text-primary" : ""}`}
                    key={player.id}
                  >
                    {player.username}
                    {player.id === user?.id && " (You)"}
                    {index === 0 && " 👑"}
                  </li>
                ))}
              </ul>
              {gameMaster && (
                <p className="mt-2 text-muted-foreground text-xs">
                  👑 = Game Master
                </p>
              )}
            </div>
          </div>
        </header>

        <main className="mb-8 flex flex-col items-center">
          {status === "waiting" ? (
            <div className="text-center">
              <p className="mb-4 text-muted-foreground">
                {getWaitingMessage()}
              </p>
              {isRoomFull && isGameMaster && (
                <button
                  className="rounded-lg bg-primary px-6 py-3 font-semibold hover:bg-primary/80"
                  onClick={handleStartGame}
                  type="button"
                >
                  Start Game
                </button>
              )}
            </div>
          ) : (
            <div />
          )}
        </main>

        <footer className="text-center">
          <button
            className="rounded-lg bg-destructive px-4 py-2 text-destructive-foreground hover:bg-destructive/80"
            onClick={handleLeaveRoom}
            type="button"
          >
            Leave Room
          </button>
        </footer>
      </div>
    </div>
  );
}
