import { apiRequest } from "./api";

export interface SidebarSuggestedUser {
  id: string;
  username: string;
  displayName: string;
  avatar: string | null;
}

export interface TrendingHashtag {
  hashtag: string;
  count: number;
}

interface SuggestionsResponse {
  success: boolean;
  users: SidebarSuggestedUser[];
}

interface TrendingResponse {
  success: boolean;
  trending: TrendingHashtag[];
}

export async function getSidebarSuggestions() {
  const response =
    await apiRequest<SuggestionsResponse>(
      "/sidebar/suggestions",
    );

  return response.users;
}

export async function getTrendingHashtags() {
  const response =
    await apiRequest<TrendingResponse>(
      "/sidebar/trending",
    );

  return response.trending;
}
