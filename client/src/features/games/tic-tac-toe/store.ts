import { create } from "zustand";

export type CellValue = "X" | "O" | null;
export type GameStatus = "waiting" | "playing" | "finished";

export type TicTacToeState = {
  board: CellValue[];
  currentPlayer: "X" | "O";
  playerSymbol: "X" | "O" | null;
  winner: "X" | "O" | "draw" | null;
  status: GameStatus;
};

type TicTacToeActions = {
  startGame: (playerSymbol: "X" | "O") => void;
  makeMove: (index: number) => void;
  resetGame: () => void;
  setGameState: (state: Partial<TicTacToeState>) => void;
};

const BOARD_SIZE = 9;
const FIRST_ROW_START = 0;
const FIRST_ROW_MID = 1;
const FIRST_ROW_END = 2;
const SECOND_ROW_START = 3;
const SECOND_ROW_MID = 4;
const SECOND_ROW_END = 5;
const THIRD_ROW_START = 6;
const THIRD_ROW_MID = 7;
const THIRD_ROW_END = 8;

const WIN_PATTERNS = [
  [FIRST_ROW_START, FIRST_ROW_MID, FIRST_ROW_END],
  [SECOND_ROW_START, SECOND_ROW_MID, SECOND_ROW_END],
  [THIRD_ROW_START, THIRD_ROW_MID, THIRD_ROW_END],
  [FIRST_ROW_START, SECOND_ROW_START, THIRD_ROW_START],
  [FIRST_ROW_MID, SECOND_ROW_MID, THIRD_ROW_MID],
  [FIRST_ROW_END, SECOND_ROW_END, THIRD_ROW_END],
  [FIRST_ROW_START, SECOND_ROW_MID, THIRD_ROW_END],
  [FIRST_ROW_END, SECOND_ROW_MID, THIRD_ROW_START],
] as const;

const initialState: TicTacToeState = {
  board: Array.from({ length: BOARD_SIZE }).fill(null) as CellValue[],
  currentPlayer: "X",
  playerSymbol: null,
  winner: null,
  status: "waiting",
};

// Helper function to check for a winner
function checkWinner(board: CellValue[]): "X" | "O" | null {
  for (const pattern of WIN_PATTERNS) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  return null;
}

export const useTicTacToeStore = create<TicTacToeState & TicTacToeActions>()(
  (set) => ({
    ...initialState,

    startGame: (playerSymbol: "X" | "O") =>
      set({
        playerSymbol,
        status: "playing",
        board: Array.from({ length: BOARD_SIZE }).fill(null) as CellValue[],
        currentPlayer: "X",
        winner: null,
      }),

    makeMove: (index: number) =>
      set((state) => {
        const { board, currentPlayer, status } = state;

        // Don't allow moves if game is not in playing status or cell is filled
        if (status !== "playing" || board[index]) {
          return state;
        }

        // Make the move
        const newBoard = [...board];
        newBoard[index] = currentPlayer;

        // Check game end conditions
        const winner = checkWinner(newBoard);
        const isBoardFull = newBoard.every((cell) => cell !== null);
        const gameEnded = winner || isBoardFull;

        return {
          board: newBoard,
          currentPlayer: currentPlayer === "X" ? "O" : "X",
          winner: winner || (isBoardFull ? "draw" : null),
          status: gameEnded ? "finished" : "playing",
        };
      }),

    resetGame: () => set(initialState),

    setGameState: (newState: Partial<TicTacToeState>) =>
      set((state) => ({
        ...state,
        ...newState,
      })),
  })
);
