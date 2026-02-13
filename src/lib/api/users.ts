import apiClient from "./client";
import type { User } from "./auth";

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  gender?: "MALE" | "FEMALE";
  birthDate?: string; // ISO date string e.g. "1995-06-15"
}

export async function getProfile(): Promise<User> {
  return apiClient.get("/users/profile");
}

export async function updateProfile(
  payload: UpdateProfilePayload,
): Promise<User> {
  return apiClient.patch("/users/profile", payload);
}
