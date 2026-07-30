import { apiGet, apiPost } from "./client";

export interface AdminUser {
  username: string;
}

export function login(username: string, password: string): Promise<AdminUser> {
  return apiPost<AdminUser>("/auth/login", { username, password });
}

export function logout(): Promise<void> {
  return apiPost<void>("/auth/logout");
}

export function getCurrentAdmin(): Promise<AdminUser> {
  return apiGet<AdminUser>("/auth/me");
}
