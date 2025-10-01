import { GiExitDoor } from "react-icons/gi";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/util/tw-merge";

export function LogoutButton({ className }: { className?: string }) {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast("Logged out successfully");
    navigate("/signin");
  };

  return (
    <button
      className={cn(
        "flex size-10 items-center justify-center rounded-full bg-destructive p-2 hover:bg-destructive/80",
        className
      )}
      onClick={handleLogout}
      type="button"
    >
      <GiExitDoor size={26} />
    </button>
  );
}
