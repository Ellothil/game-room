export type ServerToClientEvents = {
  "room:list": (rooms: GameRoom[]) => void;
  "room:joined": (room: GameRoom) => void;
  "room:left": (roomId: string) => void;
  "room:playerJoined": (payload: { roomId: string; player: Player }) => void;
  "room:playerLeft": (payload: { roomId: string; playerId: string }) => void;
  "room:join:error": (payload: { message: string }) => void;
};

export type ClientToServerEvents = {
  "room:join": (roomId: string, user: Player) => void;
  "room:leave": (roomId: string) => void;
  "room:list": () => void;
};

export type SocketData = {
  name: string;
  age: number;
};

export type Player = {
  id: string;
  username: string;
};

export type GameRoom = {
  id: string;
  name: string;
  players: Player[];
  maxPlayers: number;
  gameType: "tic-tac-toe";
};
