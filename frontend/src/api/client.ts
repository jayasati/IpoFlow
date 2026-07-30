const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export class ApiError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      body && typeof body === "object" && "error" in body && typeof body.error === "string"
        ? body.error
        : `Request failed with status ${response.status}`;
    const details =
      body && typeof body === "object" && "details" in body ? body.details : undefined;
    throw new ApiError(message, response.status, details);
  }

  return body as T;
}

export function apiGet<T>(path: string): Promise<T> {
  return fetch(`${API_BASE_URL}${path}`, { credentials: "include" }).then((res) =>
    handleResponse<T>(res),
  );
}

export function apiPost<T>(path: string, data?: unknown): Promise<T> {
  return fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: data === undefined ? undefined : JSON.stringify(data),
  }).then((res) => handleResponse<T>(res));
}

export function apiPut<T>(path: string, data?: unknown): Promise<T> {
  return fetch(`${API_BASE_URL}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: data === undefined ? undefined : JSON.stringify(data),
  }).then((res) => handleResponse<T>(res));
}

export function apiDelete<T = void>(path: string): Promise<T> {
  return fetch(`${API_BASE_URL}${path}`, { method: "DELETE", credentials: "include" }).then(
    (res) => handleResponse<T>(res),
  );
}
