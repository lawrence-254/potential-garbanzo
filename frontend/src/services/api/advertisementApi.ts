import { apiRequest } from "./api";

export interface Advertisement {
  id: string;
  advertiser: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  targetUrl: string;
  ctaText: string;
}

interface AdvertisementsResponse {
  success: boolean;
  advertisements: Advertisement[];
}

interface AdvertisementClickResponse {
  success: boolean;
  targetUrl: string;
}

export async function getAdvertisements(): Promise<Advertisement[]> {
  const response = await apiRequest<AdvertisementsResponse>(
    "/advertisements",
  );

  return response.advertisements;
}

export async function recordAdvertisementClick(
  id: string,
): Promise<string> {
  const response = await apiRequest<AdvertisementClickResponse>(
    `/advertisements/${id}/click`,
    {
      method: "POST",
    },
  );

  return response.targetUrl;
}
