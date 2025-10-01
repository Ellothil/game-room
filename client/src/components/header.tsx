import { LogoutButton } from "./logout-button";
import { ProfileButton } from "./profile-button";

export function Header({ title }: { title: string }) {
  return (
    <header className="flex min-h-16 w-full items-center justify-between gap-4 border-b py-2">
      <h1 className="pl-4 font-bold text-3xl">{title}</h1>
      <div className="flex gap-2">
        <ProfileButton />
        <LogoutButton />
      </div>
    </header>
  );
}
