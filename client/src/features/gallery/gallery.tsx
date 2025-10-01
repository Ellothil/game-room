import { LogoutButton } from "@/components/logout-button";
import { SettingsButton } from "@/components/settings-button";
import { useAuthStore } from "../../stores/auth-store";
import { useRoomStore } from "../../stores/room-store";
import { Room } from "../room/room";
import { RoomList } from "./room-list";

export function Gallery() {
  const user = useAuthStore((state) => state.user);
  const currentRoom = useRoomStore((state) => state.currentRoom);
  const setCurrentRoom = useRoomStore((state) => state.setCurrentRoom);

  // If user is in a room, show the Room view
  if (currentRoom) {
    return <Room onLeave={() => setCurrentRoom(null)} room={currentRoom} />;
  }

  // Otherwise, show the gallery
  return (
    <div className="mx-16 flex h-screen w-full flex-col items-center justify-center pt-2">
      <header className="flex min-h-16 w-full items-center justify-between gap-4 border-b py-2">
        <h1 className="pl-4 font-bold text-3xl">Game Rooms</h1>
        <div className="flex gap-2">
          <SettingsButton />
          <LogoutButton />
        </div>
      </header>
      <main className="flex h-full w-full flex-col gap-4 p-8">
        <p className="text-center">Welcome {user?.username}!</p>
        <RoomList />
      </main>
    </div>
  );
}
