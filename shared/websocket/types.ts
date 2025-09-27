export type ServerToClientEvents = {
  "test:pong": (payload: { message: string }) => void;
};

export type ClientToServerEvents = {
  "test:ping": (payload: { message: string }) => void;
};
