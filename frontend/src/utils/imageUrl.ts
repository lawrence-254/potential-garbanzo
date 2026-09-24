const API_SERVER_URL =
  import.meta.env.VITE_SERVER_URL ||
  "http://localhost:5000";

export function getImageUrl(
  imagePath: string
): string {
  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://")
  ) {
    return imagePath;
  }

  return `${API_SERVER_URL}${imagePath}`;
}
