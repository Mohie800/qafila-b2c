import apiClient from "./client";

export interface RequestOtpPayload {
  phoneNumber: string;
}

export interface VerifyOtpPayload {
  phoneNumber: string;
  otp: string;
}

export interface User {
  id: string;
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role: "ADMIN" | "VENDOR" | "CUSTOMER";
  gender?: "MALE" | "FEMALE";
  birthDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export async function requestOtp(payload: RequestOtpPayload): Promise<void> {
  await apiClient.post("/auth/otp/request", payload);
}

export async function verifyOtp(
  payload: VerifyOtpPayload,
): Promise<AuthResponse> {
  return apiClient.post("/auth/otp/verify", payload);
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
}
