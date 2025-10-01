import { Header } from "@/components/header";
import { ProfileSetupModal } from "@/components/profile-setup-modal";
import { useAuthStore } from "../../stores/auth-store";
import { RoomList } from "./room-list";

export function Gallery() {
  const user = useAuthStore((state) => state.user);

  // Show profile setup modal if user hasn't completed their profile
  const showProfileSetup = !user?.profileCompleted;

  return (
    <div className="mx-16 flex h-screen w-full flex-col items-center justify-center pt-2">
      {showProfileSetup && <ProfileSetupModal />}

      <Header title="Game Rooms" />
      <main className="flex h-full w-full flex-col gap-4 p-8">
        <h1 className="text-center font-bold text-2xl underline">
          Welcome {user?.displayName || user?.username}!
        </h1>
        <RoomList />
      </main>
    </div>
  );
}
