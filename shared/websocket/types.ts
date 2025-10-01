export type ServerToClientEvents = {
  "room:list": (rooms: GameRoom[]) => void;
  "room:joined": (room: GameRoom) => void;
  "room:left": (roomId: string) => void;
  "room:playerJoined": (payload: { roomId: string; player: Player }) => void;
  "room:playerLeft": (payload: { roomId: string; playerId: string }) => void;
  "room:join:error": (payload: { message: string }) => void;
  "game:start": (payload: GameStartPayload) => void;
  "game:move": (payload: GameMovePayload) => void;
  "game:end": (payload: GameEndPayload) => void;
  "game:error": (payload: { message: string }) => void;
};

export type ClientToServerEvents = {
  "room:join": (roomId: string, user: Player) => void;
  "room:leave": (roomId: string) => void;
  "room:list": () => void;
  "game:start": (roomId: string) => void;
  "game:move": (payload: { roomId: string; moveData: TicTacToeMove }) => void;
};

export type SocketData = {
  name: string;
  age: number;
};

export type Player = {
  id: string;
  username: string;
  profilePicture?: string;
  joinedAt?: number; // Timestamp when player joined the room
};

export type GameRoom = {
  id: string;
  name: string;
  players: Player[];
  maxPlayers: number;
  gameType: "tic-tac-toe";
};

export type TicTacToeMove = {
  index: number;
  playerId: string;
};

export type GameStartPayload = {
  roomId: string;
  gameType: "tic-tac-toe";
  players: {
    playerId: string;
    symbol: "X" | "O";
  }[];
};

export type GameMovePayload = {
  roomId: string;
  move: TicTacToeMove;
  board: Array<"X" | "O" | null>;
  currentPlayer: "X" | "O";
};

export type GameEndPayload = {
  roomId: string;
  winner: "X" | "O" | "draw";
  board: Array<"X" | "O" | null>;
};
