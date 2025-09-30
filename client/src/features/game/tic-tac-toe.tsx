import { useAuthStore } from "../../stores/auth-store";
import { useGameStore } from "../../stores/game-store";
import { socket } from "../../websocket/socket";

type TicTacToeProps = {
  roomId: string;
  isMyTurn: boolean;
};

export function TicTacToeBoard({ roomId, isMyTurn }: TicTacToeProps) {
  const user = useAuthStore((state) => state.user);
  const { board, currentPlayer, playerSymbol, winner, status } = useGameStore(
    (state) => state.ticTacToe
  );
  const makeMove = useGameStore((state) => state.makeMove);

  const handleCellClick = (index: number) => {
    // Only allow moves if it's the player's turn and game is playing
    if (!isMyTurn || status !== "playing" || board[index] || !user) {
      return;
    }

    // Optimistically update local state
    makeMove(index);

    // Send move to server
    socket.emit("game:move", {
      roomId,
      moveData: {
        index,
        playerId: user.id,
      },
    });
  };

  const getCellContent = (index: number) => {
    const value = board[index];
    if (!value) {
      return "";
    }
    return value;
  };

  const getStatusMessage = () => {
    if (status === "waiting") {
      return "Waiting for game to start...";
    }

    if (status === "finished") {
      if (winner === "draw") {
        return "Game ended in a draw!";
      }
      if (winner === playerSymbol) {
        return "🎉 You won!";
      }
      return `${winner} wins!`;
    }

    if (isMyTurn) {
      return "Your turn";
    }
    return `${currentPlayer}'s turn`;
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <p className="mb-2 text-lg font-semibold">
          You are: <span className="text-2xl font-bold text-primary">{playerSymbol}</span>
        </p>
        <p className="text-xl font-medium">{getStatusMessage()}</p>
      </div>

      <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted p-4">
        {board.map((_, index) => {
          const cellKey = `cell-${index}`;
          const isClickable = isMyTurn && status === "playing" && !board[index];
          const cellClasses = `flex h-20 w-20 items-center justify-center rounded-md bg-card text-4xl font-bold transition-colors ${
            isClickable ? "cursor-pointer hover:bg-primary/20" : "cursor-not-allowed"
          } ${board[index] ? "opacity-100" : "opacity-50"}`;

          return (
            <button
              className={cellClasses}
              disabled={!isMyTurn || status !== "playing" || Boolean(board[index])}
              key={cellKey}
              onClick={() => handleCellClick(index)}
              type="button"
            >
              {getCellContent(index)}
            </button>
          );
        })}
      </div>

      {status === "finished" && (
        <div className="mt-4 rounded-lg bg-muted p-4 text-center">
          <p className="font-semibold">Game Over</p>
          <p className="mt-2 text-sm">Leave the room to play again</p>
        </div>
      )}
    </div>
  );
}
