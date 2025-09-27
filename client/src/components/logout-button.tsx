import { GiExitDoor } from "react-icons/gi";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";

export function LogoutButton() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast("Logged out successfully");
    navigate("/signin");
  };

  return (
    <button
      className="flex size-10 items-center justify-center rounded-full bg-destructive p-2 text-destructive-foreground hover:bg-destructive/80"
      onClick={handleLogout}
      type="button"
    >
      <GiExitDoor size={26} />
    </button>
  );
}
