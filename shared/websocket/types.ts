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
  "game:rematch": (payload: GameStartPayload) => void;
};

export type ClientToServerEvents = {
  "room:join": (roomId: string, user: Player) => void;
  "room:leave": (roomId: string) => void;
  "room:list": () => void;
  "game:start": (roomId: string) => void;
  "game:rematch": (roomId: string) => void;
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
  gameType: string;
};
