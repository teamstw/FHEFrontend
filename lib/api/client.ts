export const base = process.env.NEXT_PUBLIC_CEPP_API_URL?.replace(/\/$/, "");
export const backendEnabled = Boolean(base);
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  if (!base) throw new Error("Backend is not configured");
  const response = await fetch(base + path, {
    ...init,
    credentials: "include",
    headers: {
      ...(init.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...init.headers,
    },
  });
  if (!response.ok)
    throw new ApiError(
      response.status,
      `Request failed (${response.status}). Please try again.`,
    );
  return response.status === 204 ? (undefined as T) : response.json();
}
