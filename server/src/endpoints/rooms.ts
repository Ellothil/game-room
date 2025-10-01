import { Router } from "express";
import type { GameRoom } from "shared/websocket/types";
import { OK } from "./http-codes";

const router: Router = Router();

const rooms: GameRoom[] = [
  {
    id: "tic-tac-toe",
    name: "Tic Tac Toe",
    players: [],
    maxPlayers: 2,
    gameType: "tic-tac-toe",
  },
];

router.get("/", (_req, res) => {
  res.status(OK).json(rooms);
});

export default router;
