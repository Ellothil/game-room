import { api } from "../util/api";

export async function registerUser(username: string, password: string) {
  const response = await api.post("/auth/register", {
    username,
    password,
  });
  return response;
}
