// client/src/app.tsx
import { cn } from "@util/tw-merge"; // Assuming you have a cn utility from your files
import { useEffect, useState } from "react";
import { socket } from "./websocket/socket";

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [pongMessage, setPongMessage] = useState("");

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
      setPongMessage(""); // Clear message on disconnect
    }

    function onPong(payload: { message: string }) {
      setPongMessage(payload.message);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("test:pong", onPong);

    // Manually connect
    socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("test:pong", onPong);
      socket.disconnect();
    };
  }, []);

  const sendPing = () => {
    setPongMessage("Waiting for server...");
    socket.emit("test:ping", { message: "Ping from client!" });
  };

  return (
    <main className="flex h-screen flex-col items-center justify-center gap-4 bg-background text-foreground">
      <h1 className="font-bold text-2xl">WebSocket Test UI</h1>
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "h-4 w-4 rounded-full",
            isConnected ? "bg-green-500" : "bg-red-500"
          )}
        />
        <p>{isConnected ? "Connected" : "Disconnected"}</p>
      </div>

      <button
        className="rounded bg-primary px-4 py-2 text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!isConnected}
        onClick={sendPing}
        type="button"
      >
        Send Ping to Server
      </button>

      {pongMessage && (
        <p className="mt-4 rounded-md bg-muted p-3 text-muted-foreground">
          Server says: <span className="font-semibold">{pongMessage}</span>
        </p>
      )}
    </main>
  );
}

export default App;
