import { apiRequest } from "./api";

interface FollowResponse {
  success: boolean;
  following: boolean;
  followerCount: number;
}

interface FollowStatusResponse {
  success: boolean;
  following: boolean;
  followerCount: number;
  followingCount: number;
}

export async function followUser(
  userId: string,
): Promise<FollowResponse> {
  return apiRequest<FollowResponse>(
    `/follows/${userId}`,
    {
      method: "POST",
    },
  );
}

export async function unfollowUser(
  userId: string,
): Promise<FollowResponse> {
  return apiRequest<FollowResponse>(
    `/follows/${userId}`,
    {
      method: "DELETE",
    },
  );
}

export async function getFollowStatus(
  userId: string,
): Promise<FollowStatusResponse> {
  return apiRequest<FollowStatusResponse>(
    `/follows/status/${userId}`,
  );
}