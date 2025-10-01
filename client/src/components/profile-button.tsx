import { useState } from "react";
import { FaUser } from "react-icons/fa";
import { useAuthStore } from "../stores/auth-store";
import { AccountSettings } from "./account-settings";

export function ProfileButton() {
  const user = useAuthStore((state) => state.user);
  const [showSettings, setShowSettings] = useState(false);

  const serverUrl = import.meta.env.VITE_SERVER_URL;

  return (
    <>
      <button
        className="flex size-10 items-center justify-center overflow-hidden rounded-full border-2 border-primary bg-primary/10 hover:border-primary/80"
        onClick={() => setShowSettings(true)}
        type="button"
      >
        {user?.profilePicture ? (
          <div
            className="size-full bg-center bg-cover"
            style={{
              backgroundImage: `url(${serverUrl}${user.profilePicture})`,
            }}
          />
        ) : (
          <FaUser className="text-primary" size={20} />
        )}
      </button>

      {showSettings && (
        <AccountSettings onClose={() => setShowSettings(false)} />
      )}
    </>
  );
}
