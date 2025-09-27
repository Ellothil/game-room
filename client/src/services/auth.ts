import { api } from "../util/api";

export async function registerUser(username: string, password: string) {
  await api.post("/auth/register", {
    username,
    password,
  });
}
