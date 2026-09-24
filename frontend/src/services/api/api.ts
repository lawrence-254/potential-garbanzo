
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface ApiOptions extends RequestInit {
  body?: BodyInit | null;
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<T> {
  const isFormData = options.body instanceof FormData;

  const headers = new Headers(options.headers);

  // Only set JSON Content-Type for non-FormData requests.
  // For FormData, the browser automatically sets:
  // multipart/form-data; boundary=...
  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}
