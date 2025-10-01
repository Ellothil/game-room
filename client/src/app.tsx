import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import type { GameRoom } from "shared/websocket/types";
import { toast } from "sonner";
import { SignInPage } from "./features/auth/sign-in";
import { Gallery } from "./features/gallery/gallery";
import { registerTicTacToeEventHandlers } from "./features/games/tic-tac-toe/event-handlers";
import { useAuthStore } from "./stores/auth-store";
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
      // Update the room in the rooms list (it will show inline in the list)
      useRoomStore.getState().updateRoom(room);
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
    const getCurrentUserId = () => useAuthStore.getState().user?.id;
    const ticTacToeHandlers = registerTicTacToeEventHandlers(getCurrentUserId);

    // Register all listeners
    socket.on("room:list", handleRoomList);
    socket.on("room:joined", handleRoomJoined);
    socket.on("room:join:error", handleJoinError);
    socket.on("room:playerJoined", handlePlayerJoined);
    socket.on("room:playerLeft", handlePlayerLeft);

    // Register tic-tac-toe specific event handlers
    for (const [event, handler] of Object.entries(ticTacToeHandlers)) {
      socket.on(event as never, handler as never);
    }

    // Cleanup on unmount or authentication change
    return () => {
      socket.off("room:list", handleRoomList);
      socket.off("room:joined", handleRoomJoined);
      socket.off("room:join:error", handleJoinError);
      socket.off("room:playerJoined", handlePlayerJoined);
      socket.off("room:playerLeft", handlePlayerLeft);

      // Cleanup tic-tac-toe event handlers
      for (const [event, handler] of Object.entries(ticTacToeHandlers)) {
        socket.off(event as never, handler as never);
      }

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
