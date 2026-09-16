import { apiRequest } from "./api";

export interface CommentAuthor {
  id: string;
  username: string;
  displayName: string;
  avatar?: string | null;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  postId: string;
  author: CommentAuthor;
}

interface GetCommentsResponse {
  success: boolean;
  comments: Comment[];
}

interface CreateCommentResponse {
  success: boolean;
  comment: Comment;
}

export async function getComments(
  postId: string,
): Promise<Comment[]> {
  const response = await apiRequest<GetCommentsResponse>(
    `/comments/post/${postId}`,
  );

  return response.comments;
}

export async function createComment(
  postId: string,
  content: string,
): Promise<Comment> {
  const response = await apiRequest<CreateCommentResponse>(
    `/comments/post/${postId}`,
    {
      method: "POST",
      body: JSON.stringify({
        content,
      }),
    },
  );

  return response.comment;
}

export async function deleteComment(
  commentId: string,
): Promise<void> {
  await apiRequest(`/comments/${commentId}`, {
    method: "DELETE",
  });
}