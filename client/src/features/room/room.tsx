import type { GameRoom } from "shared/websocket/types";
import { useAuthStore } from "../../stores/auth-store";
import { useGameStore } from "../../stores/game-store";
import { socket } from "../../websocket/socket";
import { TicTacToeBoard } from "../game/tic-tac-toe";

type RoomProps = {
  room: GameRoom;
  onLeave: () => void;
};

export function Room({ room, onLeave }: RoomProps) {
  const user = useAuthStore((state) => state.user);
  const { status, currentPlayer, playerSymbol } = useGameStore(
    (state) => state.ticTacToe
  );

  const handleLeaveRoom = () => {
    socket.emit("room:leave", room.id);
    onLeave();
  };

  const handleStartGame = () => {
    socket.emit("game:start", room.id);
  };

  const isRoomFull = room.players.length === room.maxPlayers;
  const isMyTurn =
    playerSymbol !== null && currentPlayer === playerSymbol && status === "playing";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        <header className="mb-8 text-center">
          <h1 className="mb-2 font-bold text-3xl">{room.name}</h1>
          <div className="flex items-center justify-center gap-4">
            <div className="rounded-lg bg-muted p-3">
              <h2 className="mb-2 font-semibold text-sm">Players:</h2>
              <ul className="space-y-1">
                {room.players.map((player) => (
                  <li
                    className={`text-sm ${player.id === user?.id ? "font-bold text-primary" : ""}`}
                    key={player.id}
                  >
                    {player.username} {player.id === user?.id && "(You)"}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </header>

        <main className="mb-8 flex flex-col items-center">
          {status === "waiting" ? (
            <div className="text-center">
              <p className="mb-4 text-muted-foreground">
                {isRoomFull
                  ? "All players ready! Start the game when ready."
                  : `Waiting for ${room.maxPlayers - room.players.length} more player(s)...`}
              </p>
              {isRoomFull && (
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
            <TicTacToeBoard isMyTurn={isMyTurn} roomId={room.id} />
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
