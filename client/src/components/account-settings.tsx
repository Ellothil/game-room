import { useCallback, useEffect, useState } from "react";
import { MdClose, MdDelete, MdUpload } from "react-icons/md";
import { toast } from "sonner";
import {
  deletePicture,
  getProfilePictures,
  setCurrentPicture,
  updateDisplayName,
  uploadProfilePicture,
} from "../services/profile";
import { useAuthStore } from "../stores/auth-store";

type ProfilePicture = {
  id: string;
  filePath: string;
  uploadedAt: string;
};

type AccountSettingsProps = {
  onClose: () => void;
};

export function AccountSettings({ onClose }: AccountSettingsProps) {
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const [displayName, setDisplayName] = useState(
    user?.displayName || user?.username || ""
  );
  const [pictures, setPictures] = useState<ProfilePicture[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const serverUrl = import.meta.env.VITE_SERVER_URL;

  const loadPictures = useCallback(async () => {
    try {
      const response = await getProfilePictures(user?.id || "");
      type ApiPicture = {
        id: string;
        filePath: string;
        uploadedAt: string;
      };
      setPictures(
        response.data.pictures.map((p: ApiPicture) => ({
          id: p.id,
          filePath: p.filePath,
          uploadedAt: p.uploadedAt,
        }))
      );
    } catch {
      // Silently fail
    }
  }, [user?.id]);

  useEffect(() => {
    loadPictures();
  }, [loadPictures]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await uploadProfilePicture(user?.id || "", file);

      toast.success("Profile picture uploaded!");
      await loadPictures();

      // Update current picture if it's the first one
      if (pictures.length === 0) {
        updateProfile({ profilePicture: response.data.pictureUrl });
      }
    } catch {
      toast.error("Failed to upload picture");
    } finally {
      setIsLoading(false);
      // Reset file input
      e.target.value = "";
    }
  };

  const handleSetCurrentPicture = async (
    pictureId: string,
    filePath: string
  ) => {
    try {
      await setCurrentPicture(user?.id || "", pictureId);
      updateProfile({ profilePicture: filePath });
      toast.success("Profile picture updated!");
    } catch {
      toast.error("Failed to set profile picture");
    }
  };

  const handleDeletePicture = async (pictureId: string) => {
    try {
      await deletePicture(user?.id || "", pictureId);
      toast.success("Picture deleted!");
      await loadPictures();

      // If deleted current picture, update user state
      const deletedPicture = pictures.find((p) => p.id === pictureId);
      if (deletedPicture?.filePath === user?.profilePicture) {
        updateProfile({ profilePicture: undefined });
      }
    } catch {
      toast.error("Failed to delete picture");
    }
  };

  const handleUpdateName = async () => {
    if (!displayName.trim()) {
      toast.error("Display name cannot be empty");
      return;
    }

    try {
      const response = await updateDisplayName(
        user?.id || "",
        displayName.trim()
      );
      updateProfile({ displayName: response.data.displayName });
      toast.success("Display name updated!");
    } catch {
      toast.error("Failed to update name");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-2xl rounded-2xl border-2 bg-background p-8">
        <button
          className="absolute top-4 right-4 rounded-full p-2 hover:bg-accent"
          onClick={onClose}
          type="button"
        >
          <MdClose size={20} />
        </button>

        <h2 className="mb-6 font-bold text-2xl">Account Settings</h2>

        {/* Display Name Section */}
        <div className="mb-6">
          <label
            className="mb-2 block font-medium text-sm"
            htmlFor="displayName"
          >
            Display Name
          </label>
          <div className="flex gap-2">
            <input
              className="flex-1 rounded-lg border px-3 py-2"
              id="displayName"
              onChange={(e) => setDisplayName(e.target.value)}
              type="text"
              value={displayName}
            />
            <button
              className="rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/80"
              onClick={handleUpdateName}
              type="button"
            >
              Update
            </button>
          </div>
        </div>

        {/* Profile Pictures Section */}
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-medium text-sm">Profile Pictures</span>
            <label
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/80"
              htmlFor="fileUpload"
            >
              <MdUpload size={16} />
              Upload New
              <input
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                className="hidden"
                disabled={isLoading}
                id="fileUpload"
                onChange={handleFileUpload}
                type="file"
              />
            </label>
          </div>

          {pictures.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm">
              No profile pictures uploaded yet
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {pictures.map((picture) => {
                const isCurrent = picture.filePath === user?.profilePicture;
                return (
                  <div
                    className={`relative aspect-square overflow-hidden rounded-lg border-2 ${
                      isCurrent ? "border-primary" : "border-border"
                    }`}
                    key={picture.id}
                  >
                    <div
                      className="size-full bg-center bg-cover"
                      style={{
                        backgroundImage: `url(${serverUrl}${picture.filePath})`,
                      }}
                    />
                    {isCurrent && (
                      <div className="absolute top-2 left-2 rounded bg-primary px-2 py-1 font-medium text-primary-foreground text-xs">
                        Current
                      </div>
                    )}
                    <div className="absolute right-0 bottom-0 left-0 flex gap-1 bg-black/70 p-2">
                      {!isCurrent && (
                        <button
                          className="flex-1 rounded bg-primary px-2 py-1 text-primary-foreground text-xs hover:bg-primary/80"
                          onClick={() =>
                            handleSetCurrentPicture(
                              picture.id,
                              picture.filePath
                            )
                          }
                          type="button"
                        >
                          Set Current
                        </button>
                      )}
                      <button
                        className="rounded bg-destructive px-2 py-1 text-destructive-foreground hover:bg-destructive/80"
                        onClick={() => handleDeletePicture(picture.id)}
                        type="button"
                      >
                        <MdDelete size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
