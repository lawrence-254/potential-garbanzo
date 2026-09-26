import { apiRequest } from "./api";

export interface FollowResponse {
  success: boolean;
  following: boolean;
  followerCount: number;
  followingCount: number;
}

export interface FollowStatusResponse {
  success: boolean;
  following: boolean;
  self: boolean;
  followerCount: number;
  followingCount: number;
}

export async function followUser(
  username: string,
): Promise<FollowResponse> {
  return apiRequest<FollowResponse>(
    `/follows/${encodeURIComponent(username)}`,
    {
      method: "POST",
    },
  );
}

export async function unfollowUser(
  username: string,
): Promise<FollowResponse> {
  return apiRequest<FollowResponse>(
    `/follows/${encodeURIComponent(username)}`,
    {
      method: "DELETE",
    },
  );
}

export async function getFollowStatus(
  username: string,
): Promise<FollowStatusResponse> {
  return apiRequest<FollowStatusResponse>(
    `/follows/${encodeURIComponent(username)}/status`,
  );
}
