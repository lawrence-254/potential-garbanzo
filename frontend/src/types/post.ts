export interface PostAuthor {
  id: string;
  username: string;
  displayName: string;
  avatar?: string | null;
}

export interface PostImage {
  id: string;
  url: string;
  isThumbnail: boolean;
  order: number;
  postId: string;
  createdAt: string;
}

export interface Post {
  id: string;

  title: string;
  content: string;

  thumbnail: string | null;

  code: string | null;
  codeLanguage: string | null;

  images: PostImage[];

  createdAt: string;
  updatedAt: string;

  authorId: string;
  author: PostAuthor;

  likeCount: number;
  commentCount: number;
  likedByCurrentUser: boolean;
}
