import { apiRequest } from "./api";
import type { Post } from "../../types/post";

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

export async function getPosts(): Promise<Post[]> {
  const response =
    await apiRequest<GetPostsResponse>("/posts");

  return response.posts;
}

export async function getPost(
  postId: string
): Promise<Post> {
  const response =
    await apiRequest<GetPostResponse>(
      `/posts/${postId}`
    );

  return response.post;
}

export async function createPost(
  formData: FormData
): Promise<Post> {
  const response =
    await apiRequest<CreatePostResponse>("/posts", {
      method: "POST",
      body: formData,
    });

  return response.post;
}
