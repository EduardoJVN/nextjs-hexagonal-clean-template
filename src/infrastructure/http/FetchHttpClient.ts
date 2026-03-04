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
 * Configures automatic retry with exponential backoff.
 * Retry is applied only to transient failures (NetworkError, 503).
 * 4xx errors are never retried — they indicate client-side problems.
 */
export interface RetryOptions {
  /** Total number of attempts (including the first). Default: 3 */
  attempts: number;
  /** Initial delay in ms before the second attempt. Default: 300 */
  delayMs: number;
  /** Multiplier applied to delayMs after each failed attempt. Default: 2 */
  backoffFactor: number;
}

const DEFAULT_RETRY: RetryOptions = {
  attempts: 3,
  delayMs: 300,
  backoffFactor: 2,
};

/**
 * Adapter: FetchHttpClient
 *
 * Implements IHttpClient using the global fetch API.
 * Maps HTTP status codes to typed errors from the HttpError hierarchy.
 * Supports configurable retry with exponential backoff for transient failures.
 */
export class FetchHttpClient implements IHttpClient {
  private readonly retryOptions: RetryOptions;

  constructor(
    private readonly baseUrl: string,
    options?: {
      defaultHeaders?: Record<string, string>;
      retry?: Partial<RetryOptions>;
    },
  ) {
    this.defaultHeaders = options?.defaultHeaders;
    this.retryOptions = { ...DEFAULT_RETRY, ...options?.retry };
  }

  private readonly defaultHeaders?: Record<string, string>;

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

  /** Returns true if the error is a transient failure that warrants a retry. */
  private isRetryable(error: unknown): boolean {
    if (error instanceof NetworkError) return true;
    if (error instanceof ServiceUnavailableError) return true;
    return false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Executes fn with automatic retry on transient failures.
   * Uses exponential backoff: delayMs * backoffFactor^(attempt - 1).
   */
  private async withRetry<T>(fn: () => Promise<T>): Promise<T> {
    const { attempts, delayMs, backoffFactor } = this.retryOptions;
    let lastError: unknown;
    let currentDelay = delayMs;

    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        const isLastAttempt = attempt === attempts;
        if (isLastAttempt || !this.isRetryable(error)) {
          throw error;
        }

        await this.sleep(currentDelay);
        currentDelay *= backoffFactor;
      }
    }

    // Unreachable — the loop always throws or returns, but TypeScript needs this.
    throw lastError;
  }

  async get<T>(path: string, options?: RequestInit): Promise<T> {
    return this.withRetry(async () => {
      const response = await this.request(path, {
        ...options,
        method: "GET",
        headers: this.buildHeaders(options?.headers),
      });

      if (!response.ok) {
        return this.mapError(response);
      }

      return response.json() as Promise<T>;
    });
  }

  async post<T>(path: string, body: unknown, options?: RequestInit): Promise<T> {
    return this.withRetry(async () => {
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
    });
  }

  async put<T>(path: string, body: unknown, options?: RequestInit): Promise<T> {
    return this.withRetry(async () => {
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
    });
  }

  async patch<T>(path: string, body: unknown, options?: RequestInit): Promise<T> {
    return this.withRetry(async () => {
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
    });
  }

  async delete(path: string, options?: RequestInit): Promise<void> {
    return this.withRetry(async () => {
      const response = await this.request(path, {
        ...options,
        method: "DELETE",
        headers: this.buildHeaders(options?.headers),
      });

      if (!response.ok) {
        await this.mapError(response);
      }
    });
  }
}
