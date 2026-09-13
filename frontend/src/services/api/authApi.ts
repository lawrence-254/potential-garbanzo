import { apiRequest } from "./api";

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  displayName: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  bio?: string;
  avatar?: string;
}
export interface ProfileUser extends AuthUser {
  followersCount: number;
  followingCount: number;
  createdAt?: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  user: AuthUser;
}

export async function registerUser(
  data: RegisterData,
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function loginUser(
  data: LoginData,
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function logoutUser(): Promise<void> {
  await apiRequest("/auth/logout", {
    method: "POST",
  });
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await apiRequest<{
    success: boolean;
    user: AuthUser;
  }>("/auth/me");

  return response.user;
}

export async function getMyProfile(): Promise<ProfileUser> {
  const response = await apiRequest<{
    success: boolean;
    user: ProfileUser;
  }>("/users/me");

  return response.user;
}
export async function updateMyProfile(data: {
  displayName: string;
  bio: string;
}): Promise<ProfileUser> {
  const response = await apiRequest<{
    success: boolean;
    user: ProfileUser;
  }>("/users/me", {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  return response.user;
}