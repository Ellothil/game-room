import { api } from "../util/api";

export async function registerUser(username: string, password: string) {
  const response = await api.post("/auth/register", {
    username,
    password,
  });
  return response;
}

export async function loginUser(username: string, password: string) {
  const response = await api.post("/auth/login", {
    username,
    password,
  });
  return response;
}
