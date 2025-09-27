import { GiPokecog } from "react-icons/gi";
import { toast } from "sonner";
export function SettingsButton() {
  return (
    <button
      className="flex size-10 items-center justify-center rounded-full bg-primary p-2 text-primary-foreground hover:bg-primary/80"
      onClick={() => toast("Settings clicked")}
      type="button"
    >
      <GiPokecog size={26} />
    </button>
  );
}
