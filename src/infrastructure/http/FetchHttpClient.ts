import type { IHttpClient } from "./IHttpClient";
import {
  NetworkError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ServiceUnavailableError,
  ApiError,
} from "../errors/HttpError";

/**
 * Adapter: FetchHttpClient
 *
 * Implements IHttpClient using the global fetch API.
 * Maps HTTP status codes to typed errors from the HttpError hierarchy.
 */
export class FetchHttpClient implements IHttpClient {
  constructor(
    private readonly baseUrl: string,
    private readonly defaultHeaders?: Record<string, string>,
  ) {}

  private buildUrl(path: string): string {
    return `${this.baseUrl}${path}`;
  }

  private buildHeaders(extra?: HeadersInit): Record<string, string> {
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...this.defaultHeaders,
      ...(extra as Record<string, string> | undefined),
    };
  }

  private async mapError(response: Response): Promise<never> {
    switch (response.status) {
      case 401:
        throw new UnauthorizedError();
      case 403:
        throw new ForbiddenError();
      case 404:
        throw new NotFoundError();
      case 503:
        throw new ServiceUnavailableError();
      default:
        throw new ApiError(response.status, await response.json().catch(() => null));
    }
  }

  private async request<T>(path: string, init: RequestInit): Promise<Response> {
    const url = this.buildUrl(path);
    try {
      return await fetch(url, init);
    } catch (cause) {
      throw new NetworkError("Network request failed", cause);
    }
  }

  async get<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await this.request(path, {
      ...options,
      method: "GET",
      headers: this.buildHeaders(options?.headers),
    });

    if (!response.ok) {
      return this.mapError(response);
    }

    return response.json() as Promise<T>;
  }

  async post<T>(path: string, body: unknown, options?: RequestInit): Promise<T> {
    const response = await this.request(path, {
      ...options,
      method: "POST",
      headers: this.buildHeaders(options?.headers),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return this.mapError(response);
    }

    return response.json() as Promise<T>;
  }

  async put<T>(path: string, body: unknown, options?: RequestInit): Promise<T> {
    const response = await this.request(path, {
      ...options,
      method: "PUT",
      headers: this.buildHeaders(options?.headers),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return this.mapError(response);
    }

    return response.json() as Promise<T>;
  }

  async patch<T>(path: string, body: unknown, options?: RequestInit): Promise<T> {
    const response = await this.request(path, {
      ...options,
      method: "PATCH",
      headers: this.buildHeaders(options?.headers),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return this.mapError(response);
    }

    return response.json() as Promise<T>;
  }

  async delete(path: string, options?: RequestInit): Promise<void> {
    const response = await this.request(path, {
      ...options,
      method: "DELETE",
      headers: this.buildHeaders(options?.headers),
    });

    if (!response.ok) {
      await this.mapError(response);
    }
  }
}
