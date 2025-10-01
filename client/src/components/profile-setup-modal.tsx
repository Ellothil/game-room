import { useState } from "react";

import { toast } from "sonner";
import { setupProfile, uploadProfilePicture } from "../services/profile";
import { useAuthStore } from "../stores/auth-store";
import { LogoutButton } from "./logout-button";

export function ProfileSetupModal() {
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);

  const [displayName, setDisplayName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Setup profile with display name
      const setupResponse = await setupProfile(
        user?.id || "",
        displayName.trim()
      );

      // Upload profile picture if selected
      if (selectedFile) {
        const uploadResponse = await uploadProfilePicture(
          user?.id || "",
          selectedFile
        );

        updateProfile({
          displayName: setupResponse.data.displayName,
          profilePicture: uploadResponse.data.pictureUrl,
          profileCompleted: true,
        });
      } else {
        updateProfile({
          displayName: setupResponse.data.displayName,
          profileCompleted: true,
        });
      }

      toast.success("Profile setup completed!");
    } catch {
      toast.error("Failed to setup profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-md rounded-2xl border-2 bg-background p-8">
        <LogoutButton className="absolute top-4 right-4" />

        <h2 className="mb-4 text-center font-bold text-2xl">
          Complete Your Profile
        </h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <label
              className="mb-2 block font-medium text-sm"
              htmlFor="displayName"
            >
              Display Name
            </label>
            <input
              className="w-full rounded-lg border px-3 py-2"
              id="displayName"
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={user?.username}
              type="text"
              value={displayName}
            />
            <p className="mt-1 text-muted-foreground text-xs">
              Leave empty to use your username
            </p>
          </div>

          <div>
            <label
              className="mb-2 block font-medium text-sm"
              htmlFor="profilePicture"
            >
              Profile Picture (Optional)
            </label>
            <input
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              className="w-full rounded-lg border px-3 py-2"
              id="profilePicture"
              onChange={handleFileChange}
              type="file"
            />
            {selectedFile && (
              <p className="mt-1 text-muted-foreground text-xs">
                Selected: {selectedFile.name}
              </p>
            )}
          </div>

          <button
            className="rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/80 disabled:opacity-50"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Setting up..." : "Complete Setup"}
          </button>
        </form>
      </div>
    </div>
  );
}
