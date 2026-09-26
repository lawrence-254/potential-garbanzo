import { apiRequest } from "./api";
import type { Post } from "../../types/post";

export interface PublicUserProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatar?: string | null;
  createdAt: string;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  posts: Post[];
}

interface UserProfileResponse {
  success: boolean;
  profile: PublicUserProfile;
}
export interface UserSearchResult {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatar?: string | null;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
}

interface SearchUsersResponse {
  success: boolean;
  users: UserSearchResult[];
}

export async function searchUsers(
  query: string,
): Promise<UserSearchResult[]> {
  const response =
    await apiRequest<SearchUsersResponse>(
      `/users/search?q=${encodeURIComponent(query)}`,
    );

  return response.users;
}
export async function getUserProfile(
  username: string,
): Promise<PublicUserProfile> {
  const response =
    await apiRequest<UserProfileResponse>(
      `/users/${encodeURIComponent(username)}`,
    );

  return response.profile;
}
