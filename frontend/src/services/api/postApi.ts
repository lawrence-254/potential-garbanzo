import { apiRequest } from "./api";

export interface PostAuthor {
  id: string;
  username: string;
  displayName: string;
  avatar?: string | null;
}

export interface Post {
  id: string;
  content: string;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  author: PostAuthor;
}

interface CreatePostResponse {
  success: boolean;
  message: string;
  post: Post;
}

interface GetPostsResponse {
  success: boolean;
  posts: Post[];
}

export async function createPost(data: {
  content: string;
  image?: string;
}): Promise<Post> {
  const response = await apiRequest<CreatePostResponse>(
    "/posts",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );

  return response.post;
}

export async function getPosts(): Promise<Post[]> {
  const response = await apiRequest<GetPostsResponse>(
    "/posts",
  );

  return response.posts;
}