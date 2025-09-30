import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import type { GameRoom } from "shared/websocket/types";
import { toast } from "sonner";
import { SignInPage } from "./features/auth/sign-in";
import { Gallery } from "./features/gallery/gallery";
import { useAuthStore } from "./stores/auth-store";
import { useGameStore } from "./stores/game-store";
import { useRoomStore } from "./stores/room-store";
import { socket } from "./websocket/socket";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    // Connect socket when authenticated
    socket.connect();

    // Request initial room list
    socket.emit("room:list");

    // Listen for room list updates
    const handleRoomList = (updatedRooms: GameRoom[]) => {
      useRoomStore.getState().setRooms(updatedRooms);
    };

    // Listen for successful room join
    const handleRoomJoined = (room: GameRoom) => {
      useRoomStore.getState().setCurrentRoom(room);
      useGameStore.getState().resetGame();
      toast.success(`Joined ${room.name}!`);
    };

    // Listen for join errors
    const handleJoinError = (payload: { message: string }) => {
      toast.error(payload.message);
    };

    // Listen for player joined events
    const handlePlayerJoined = ({
      roomId,
      player,
    }: {
      roomId: string;
      player: { id: string; username: string };
    }) => {
      const currentRooms = useRoomStore.getState().rooms;
      const room = currentRooms.find((r) => r.id === roomId);
      if (room && !room.players.some((p) => p.id === player.id)) {
        useRoomStore
          .getState()
          .updateRoom({ ...room, players: [...room.players, player] });
      }
    };

    // Listen for player left events
    const handlePlayerLeft = ({
      roomId,
      playerId,
    }: {
      roomId: string;
      playerId: string;
    }) => {
      const currentRooms = useRoomStore.getState().rooms;
      const room = currentRooms.find((r) => r.id === roomId);
      if (room) {
        useRoomStore.getState().updateRoom({
          ...room,
          players: room.players.filter((p) => p.id !== playerId),
        });
      }
    };

    // Game event listeners
    const handleGameStart = (payload: {
      players: Array<{ playerId: string; symbol: "X" | "O" }>;
    }) => {
      const currentUser = useAuthStore.getState().user;
      const playerData = payload.players.find(
        (p) => p.playerId === currentUser?.id
      );
      if (playerData) {
        useGameStore.getState().startGame(playerData.symbol);
        toast.success("Game started!");
      }
    };

    const handleGameMove = (payload: {
      board: Array<"X" | "O" | null>;
      currentPlayer: "X" | "O";
    }) => {
      useGameStore.getState().setGameState({
        board: payload.board,
        currentPlayer: payload.currentPlayer,
      });
    };

    const handleGameEnd = (payload: {
      winner: "X" | "O" | "draw";
      board: Array<"X" | "O" | null>;
    }) => {
      useGameStore.getState().setGameState({
        board: payload.board,
        winner: payload.winner,
        status: "finished",
      });

      if (payload.winner === "draw") {
        toast.info("Game ended in a draw!");
      } else {
        const playerData = useGameStore.getState().ticTacToe.playerSymbol;
        if (payload.winner === playerData) {
          toast.success("🎉 You won!");
        } else {
          toast.error(`${payload.winner} wins!`);
        }
      }
    };

    const handleGameError = (payload: { message: string }) => {
      toast.error(payload.message);
    };

    // Register all listeners
    socket.on("room:list", handleRoomList);
    socket.on("room:joined", handleRoomJoined);
    socket.on("room:join:error", handleJoinError);
    socket.on("room:playerJoined", handlePlayerJoined);
    socket.on("room:playerLeft", handlePlayerLeft);
    socket.on("game:start", handleGameStart);
    socket.on("game:move", handleGameMove);
    socket.on("game:end", handleGameEnd);
    socket.on("game:error", handleGameError);

    // Cleanup on unmount or authentication change
    return () => {
      socket.off("room:list", handleRoomList);
      socket.off("room:joined", handleRoomJoined);
      socket.off("room:join:error", handleJoinError);
      socket.off("room:playerJoined", handlePlayerJoined);
      socket.off("room:playerLeft", handlePlayerLeft);
      socket.off("game:start", handleGameStart);
      socket.off("game:move", handleGameMove);
      socket.off("game:end", handleGameEnd);
      socket.off("game:error", handleGameError);
      socket.disconnect();
    };
  }, [isAuthenticated]);

  return isAuthenticated ? children : <Navigate replace to="/signin" />;
}

function App() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <BrowserRouter>
        <Routes>
          <Route element={<SignInPage />} path="/signin" />

          <Route
            element={
              <ProtectedRoute>
                <Gallery />
              </ProtectedRoute>
            }
            path="/"
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
