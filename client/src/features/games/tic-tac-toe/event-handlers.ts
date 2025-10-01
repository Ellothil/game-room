import { toast } from "sonner";
import { useTicTacToeStore } from "./store";

export function registerTicTacToeEventHandlers(
  getCurrentUserId: () => string | undefined
) {
  const handleGameStart = (payload: {
    players: Array<{ playerId: string; symbol: "X" | "O" }>;
  }) => {
    const currentUserId = getCurrentUserId();
    const playerData = payload.players.find(
      (p) => p.playerId === currentUserId
    );
    if (playerData) {
      useTicTacToeStore.getState().startGame(playerData.symbol);
      toast.success("Game started!");
    }
  };

  const handleGameMove = (payload: {
    board: Array<"X" | "O" | null>;
    currentPlayer: "X" | "O";
  }) => {
    useTicTacToeStore.getState().setGameState({
      board: payload.board,
      currentPlayer: payload.currentPlayer,
    });
  };

  const handleGameEnd = (payload: {
    winner: "X" | "O" | "draw";
    board: Array<"X" | "O" | null>;
  }) => {
    useTicTacToeStore.getState().setGameState({
      board: payload.board,
      winner: payload.winner,
      status: "finished",
    });

    if (payload.winner === "draw") {
      toast.info("Game ended in a draw!");
    } else {
      const playerSymbol = useTicTacToeStore.getState().playerSymbol;
      if (payload.winner === playerSymbol) {
        toast.success("🎉 You won!");
      } else {
        toast.error(`${payload.winner} wins!`);
      }
    }
  };

  const handleGameError = (payload: { message: string }) => {
    toast.error(payload.message);
  };

  return {
    "game:start": handleGameStart,
    "game:move": handleGameMove,
    "game:end": handleGameEnd,
    "game:error": handleGameError,
  };
}
