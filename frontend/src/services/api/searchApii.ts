import { apiRequest } from "./api";

export interface SearchUser {
   id: string;
  username: string;
  displayName: string;
  bio: string;
  avatar?: string | null;
  mutualCount?: number;
}

export interface SearchPostAuthor {
  id: string;
  username: string;
  displayName: string;
  avatar?: string | null;
}

export interface SearchPost {
  id: string;
  content: string;
  image?: string | null;
  createdAt: string;
  author: SearchPostAuthor;
  _count: {
    likes: number;
    comments: number;
  };
}

export interface SearchResults {
  users: SearchUser[];
  posts: SearchPost[];
}

interface SearchResponse {
  success: boolean;
  users: SearchUser[];
  posts: SearchPost[];
}

export async function searchContent(
  query: string,
): Promise<SearchResults> {
  const response = await apiRequest<SearchResponse>(
    `/search?q=${encodeURIComponent(query)}`,
  );

  return {
    users: response.users,
    posts: response.posts,
  };
}
interface SuggestedUsersResponse {
  success: boolean;
  users: SearchUser[];
}

export async function getSuggestedUsers(): Promise<
  SearchUser[]
> {
  const response =
    await apiRequest<SuggestedUsersResponse>(
      "/search/suggested-users",
    );

  return response.users;
}

interface ExplorePostsResponse {
  success: boolean;
  posts: SearchPost[];
}

export async function getExplorePosts(): Promise<
  SearchPost[]
> {
  const response =
    await apiRequest<ExplorePostsResponse>(
      "/search/explore-posts",
    );

  return response.posts;
}