export interface PostAuthor {
  id: string;
  name: string;
  username: string;
  avatar?: string | null;
}

export interface PostImage {
  id: string;
  url: string;
  order: number;
  isThumbnail: boolean;
}

export interface PostLike {
  id: string;
  userId: string;
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
  createdAt: string;
  updatedAt: string;

  author: PostAuthor;

  images: PostImage[];

  likes: PostLike[];

  comments: unknown[];
}
