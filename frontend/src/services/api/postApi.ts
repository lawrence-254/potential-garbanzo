import { apiRequest } from "./api";
import type { Post } from "../../types/post";

export type FeedType = "following" | "everyone";

interface GetPostsResponse {
  posts: Post[];
}

interface GetPostResponse {
  post: Post;
}

interface CreatePostResponse {
  message: string;
  post: Post;
}

//
// GET /api/posts?feed=following | everyone
//
export async function getPosts(options?: {
  feed?: FeedType;
}): Promise<Post[]> {
  const feed = options?.feed ?? "following";

  const response = await apiRequest<GetPostsResponse>(
    `/posts?feed=${feed}`
  );

  return response.posts ?? [];
}

//
// GET /api/posts/:id
//
export async function getPost(postId: string): Promise<Post> {
  const response = await apiRequest<GetPostResponse>(
    `/posts/${postId}`
  );

  return response.post;
}

//
// POST /api/posts
//
export async function createPost(
  formData: FormData
): Promise<Post> {
  const response = await apiRequest<CreatePostResponse>("/posts", {
    method: "POST",
    body: formData,
  });

  return response.post;
}
