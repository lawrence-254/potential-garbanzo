import { apiRequest } from "./api";

interface LikeResponse {
  success: boolean;
  liked: boolean;
  likeCount: number;
}

export async function likePost(
  postId: string,
): Promise<LikeResponse> {
  return apiRequest<LikeResponse>(
    `/likes/${postId}`,
    {
      method: "POST",
    },
  );
}

export async function unlikePost(
  postId: string,
): Promise<LikeResponse> {
  return apiRequest<LikeResponse>(
    `/likes/${postId}`,
    {
      method: "DELETE",
    },
  );
}