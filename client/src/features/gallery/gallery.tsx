import { LogoutButton } from "@/components/logout-button";
import { SettingsButton } from "@/components/settings-button";
import { useAuthStore } from "../../stores/auth-store";

export function Gallery() {
  const user = useAuthStore((state) => state.user);
  return (
    <div className="mx-16 flex h-screen w-full flex-col items-center justify-center pt-8">
      <header className="flex min-h-16 w-full items-center justify-between gap-4 border-b py-5">
        <h1 className="pl-4 font-bold text-3xl">Rooms</h1>
        <div className="flex gap-2">
          <SettingsButton />
          <LogoutButton />
        </div>
      </header>
      <main className="flex h-full w-lg flex-col gap-4 p-8">
        <p className="text-center">Welcome {user?.username}!</p>
      </main>
    </div>
  );
}
