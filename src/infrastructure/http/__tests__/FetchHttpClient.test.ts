import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { FetchHttpClient } from "../FetchHttpClient";
import {
  NetworkError,
  UnauthorizedError,
  NotFoundError,
  ServiceUnavailableError,
  ApiError,
} from "../../errors/HttpError";

const BASE_URL = "https://api.example.com";

function makeMockResponse(status: number, body: unknown = null, ok?: boolean): Response {
  const isOk = ok ?? (status >= 200 && status < 300);
  return {
    ok: isOk,
    status,
    json: vi.fn().mockResolvedValue(body),
    text: vi.fn().mockResolvedValue(JSON.stringify(body)),
    headers: new Headers(),
  } as unknown as Response;
}

describe("FetchHttpClient", () => {
  let client: FetchHttpClient;

  beforeEach(() => {
    // Disable retry by default in unit tests to avoid delays
    client = new FetchHttpClient(BASE_URL, { retry: { attempts: 1 } });
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  describe("GET", () => {
    it("returns parsed JSON on a successful 200 response", async () => {
      const data = [{ id: "1", title: "Hello" }];
      vi.mocked(fetch).mockResolvedValue(makeMockResponse(200, data));

      const result = await client.get<typeof data>("/todos");

      expect(result).toEqual(data);
      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL}/todos`,
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("sends Content-Type and Accept headers", async () => {
      vi.mocked(fetch).mockResolvedValue(makeMockResponse(200, {}));

      await client.get("/todos");

      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL}/todos`,
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Accept: "application/json",
          }),
        }),
      );
    });

    it("merges defaultHeaders into every request", async () => {
      const clientWithAuth = new FetchHttpClient(BASE_URL, {
        defaultHeaders: { Authorization: "Bearer token-abc" },
        retry: { attempts: 1 },
      });
      vi.mocked(fetch).mockResolvedValue(makeMockResponse(200, {}));

      await clientWithAuth.get("/todos");

      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL}/todos`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer token-abc",
            "Content-Type": "application/json",
          }),
        }),
      );
    });

    it("merges per-request options.headers with default headers", async () => {
      vi.mocked(fetch).mockResolvedValue(makeMockResponse(200, {}));

      await client.get("/todos", {
        headers: { "X-Request-ID": "req-123" },
      });

      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL}/todos`,
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            "X-Request-ID": "req-123",
          }),
        }),
      );
    });
  });

  describe("error mapping", () => {
    it("throws UnauthorizedError on 401", async () => {
      vi.mocked(fetch).mockResolvedValue(makeMockResponse(401));

      await expect(client.get("/todos")).rejects.toThrow(UnauthorizedError);
    });

    it("throws ForbiddenError on 403", async () => {
      const { ForbiddenError } = await import("../../errors/HttpError");
      vi.mocked(fetch).mockResolvedValue(makeMockResponse(403));

      await expect(client.get("/todos")).rejects.toThrow(ForbiddenError);
    });

    it("throws NotFoundError on 404", async () => {
      vi.mocked(fetch).mockResolvedValue(makeMockResponse(404));

      await expect(client.get("/todos/missing")).rejects.toThrow(NotFoundError);
    });

    it("throws ServiceUnavailableError on 503", async () => {
      vi.mocked(fetch).mockResolvedValue(makeMockResponse(503));

      await expect(client.get("/todos")).rejects.toThrow(ServiceUnavailableError);
    });

    it("throws ApiError with correct statusCode on 500", async () => {
      vi.mocked(fetch).mockResolvedValue(
        makeMockResponse(500, { message: "Internal Server Error" }),
      );

      const err = await client.get("/todos").catch((e) => e);

      expect(err).toBeInstanceOf(ApiError);
      expect(err.statusCode).toBe(500);
    });

    it("throws NetworkError when fetch itself throws (network failure)", async () => {
      vi.mocked(fetch).mockRejectedValue(new TypeError("Failed to fetch"));

      await expect(client.get("/todos")).rejects.toThrow(NetworkError);
    });

    it("NetworkError wraps the original cause", async () => {
      const originalError = new TypeError("Failed to fetch");
      vi.mocked(fetch).mockRejectedValue(originalError);

      const err = await client.get("/todos").catch((e) => e);

      expect(err).toBeInstanceOf(NetworkError);
      expect(err.cause).toBe(originalError);
    });
  });

  describe("DELETE", () => {
    it("returns void on 204 No Content", async () => {
      vi.mocked(fetch).mockResolvedValue(makeMockResponse(204));

      const result = await client.delete("/todos/1");

      expect(result).toBeUndefined();
    });

    it("calls DELETE method with correct URL", async () => {
      vi.mocked(fetch).mockResolvedValue(makeMockResponse(204));

      await client.delete("/todos/abc-123");

      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL}/todos/abc-123`,
        expect.objectContaining({ method: "DELETE" }),
      );
    });
  });

  describe("POST", () => {
    it("sends the body as JSON and returns parsed response", async () => {
      const payload = { todo_title: "Buy milk", is_done: false, completed_at: null };
      const response = { todo_id: "1", ...payload, created_at: "2024-01-01T00:00:00Z" };
      vi.mocked(fetch).mockResolvedValue(makeMockResponse(201, response));

      const result = await client.post<typeof response>("/todos", payload);

      expect(result).toEqual(response);
      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL}/todos`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(payload),
        }),
      );
    });
  });

  describe("PUT", () => {
    it("sends body as JSON and returns parsed response", async () => {
      const payload = {
        todo_title: "Updated title",
        is_done: true,
        completed_at: "2024-01-01T00:00:00Z",
      };
      const response = { todo_id: "1", ...payload, created_at: "2024-01-01T00:00:00Z" };
      vi.mocked(fetch).mockResolvedValue(makeMockResponse(200, response));

      const result = await client.put<typeof response>("/todos/1", payload);

      expect(result).toEqual(response);
      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL}/todos/1`,
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify(payload),
        }),
      );
    });
  });

  describe("retry logic", () => {
    it("retries on NetworkError and calls fetch the configured number of times", async () => {
      vi.useFakeTimers();
      const retryClient = new FetchHttpClient(BASE_URL, {
        retry: { attempts: 2, delayMs: 100, backoffFactor: 2 },
      });
      vi.mocked(fetch).mockRejectedValue(new TypeError("Failed to fetch"));

      // Run timers alongside the promise so sleeps resolve
      const promise = retryClient.get("/todos").catch((e) => e);
      await vi.runAllTimersAsync();
      const err = await promise;

      expect(err).toBeInstanceOf(NetworkError);
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it("retries on 503 ServiceUnavailableError and calls fetch the configured number of times", async () => {
      vi.useFakeTimers();
      const retryClient = new FetchHttpClient(BASE_URL, {
        retry: { attempts: 2, delayMs: 100, backoffFactor: 2 },
      });
      vi.mocked(fetch).mockResolvedValue(makeMockResponse(503));

      const promise = retryClient.get("/todos").catch((e) => e);
      await vi.runAllTimersAsync();
      const err = await promise;

      expect(err).toBeInstanceOf(ServiceUnavailableError);
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it("does NOT retry on 401 UnauthorizedError — fetch called exactly once", async () => {
      vi.useFakeTimers();
      const retryClient = new FetchHttpClient(BASE_URL, {
        retry: { attempts: 3, delayMs: 100, backoffFactor: 2 },
      });
      vi.mocked(fetch).mockResolvedValue(makeMockResponse(401));

      const promise = retryClient.get("/todos").catch((e) => e);
      await vi.runAllTimersAsync();
      const err = await promise;

      expect(err).toBeInstanceOf(UnauthorizedError);
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it("does NOT retry on 404 NotFoundError — fetch called exactly once", async () => {
      vi.useFakeTimers();
      const retryClient = new FetchHttpClient(BASE_URL, {
        retry: { attempts: 3, delayMs: 100, backoffFactor: 2 },
      });
      vi.mocked(fetch).mockResolvedValue(makeMockResponse(404));

      const promise = retryClient.get("/todos/missing").catch((e) => e);
      await vi.runAllTimersAsync();
      const err = await promise;

      expect(err).toBeInstanceOf(NotFoundError);
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it("exhausts all retries and throws the last error", async () => {
      vi.useFakeTimers();
      const retryClient = new FetchHttpClient(BASE_URL, {
        retry: { attempts: 3, delayMs: 50, backoffFactor: 2 },
      });
      vi.mocked(fetch).mockRejectedValue(new TypeError("connection reset"));

      const promise = retryClient.get("/todos").catch((e) => e);
      await vi.runAllTimersAsync();
      const err = await promise;

      expect(err).toBeInstanceOf(NetworkError);
      expect(fetch).toHaveBeenCalledTimes(3);
    });

    it("succeeds on a later retry when the first attempt fails with NetworkError", async () => {
      vi.useFakeTimers();
      const data = [{ todo_id: "1" }];
      const retryClient = new FetchHttpClient(BASE_URL, {
        retry: { attempts: 3, delayMs: 100, backoffFactor: 2 },
      });
      vi.mocked(fetch)
        .mockRejectedValueOnce(new TypeError("transient failure"))
        .mockResolvedValue(makeMockResponse(200, data));

      const promise = retryClient.get("/todos");
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toEqual(data);
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });
});
