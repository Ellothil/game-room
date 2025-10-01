import { api } from "../util/api";

export function setupProfile(userId: string, displayName: string) {
  return api.post("/profile/setup", { userId, displayName });
}

export function uploadProfilePicture(userId: string, file: File) {
  const formData = new FormData();
  formData.append("picture", file);
  formData.append("userId", userId);

  return api.post("/profile/upload-picture", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

export function getProfilePictures(userId: string) {
  return api.get(`/profile/pictures/${userId}`);
}

export function setCurrentPicture(userId: string, pictureId: string) {
  return api.post("/profile/set-current-picture", { userId, pictureId });
}

export function deletePicture(userId: string, pictureId: string) {
  return api.delete(`/profile/picture/${pictureId}`, {
    data: { userId },
  });
}

export function updateDisplayName(userId: string, displayName: string) {
  return api.post("/profile/update-name", { userId, displayName });
}
