import { describe, it, expect } from "vitest";
import {
  HttpError,
  ApiError,
  NetworkError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ServiceUnavailableError,
} from "../HttpError";

describe("HttpError", () => {
  it("is instanceof Error", () => {
    const err = new HttpError("fail", 500);
    expect(err).toBeInstanceOf(Error);
  });

  it("is instanceof HttpError", () => {
    const err = new HttpError("fail", 500);
    expect(err).toBeInstanceOf(HttpError);
  });

  it("sets statusCode correctly", () => {
    const err = new HttpError("fail", 500);
    expect(err.statusCode).toBe(500);
  });

  it("sets name to class name", () => {
    const err = new HttpError("fail", 500);
    expect(err.name).toBe("HttpError");
  });
});

describe("ApiError", () => {
  it("is instanceof Error", () => {
    expect(new ApiError(422)).toBeInstanceOf(Error);
  });

  it("is instanceof HttpError", () => {
    expect(new ApiError(422)).toBeInstanceOf(HttpError);
  });

  it("is instanceof ApiError", () => {
    expect(new ApiError(422)).toBeInstanceOf(ApiError);
  });

  it("sets statusCode correctly", () => {
    const err = new ApiError(422);
    expect(err.statusCode).toBe(422);
  });

  it("sets name to class name", () => {
    const err = new ApiError(422);
    expect(err.name).toBe("ApiError");
  });

  it("stores optional body", () => {
    const body = { error: "validation failed" };
    const err = new ApiError(422, body);
    expect(err.body).toEqual(body);
  });

  it("body is undefined when not provided", () => {
    const err = new ApiError(422);
    expect(err.body).toBeUndefined();
  });
});

describe("NetworkError", () => {
  it("is instanceof Error", () => {
    expect(new NetworkError("timeout")).toBeInstanceOf(Error);
  });

  it("is instanceof HttpError", () => {
    expect(new NetworkError("timeout")).toBeInstanceOf(HttpError);
  });

  it("is instanceof NetworkError", () => {
    expect(new NetworkError("timeout")).toBeInstanceOf(NetworkError);
  });

  it("sets statusCode to 0", () => {
    const err = new NetworkError("timeout");
    expect(err.statusCode).toBe(0);
  });

  it("sets name to class name", () => {
    const err = new NetworkError("timeout");
    expect(err.name).toBe("NetworkError");
  });

  it("stores the cause when provided", () => {
    const cause = new Error("ECONNREFUSED");
    const err = new NetworkError("Network request failed", cause);
    expect(err.cause).toBe(cause);
  });
});

describe("UnauthorizedError", () => {
  it("is instanceof Error", () => {
    expect(new UnauthorizedError()).toBeInstanceOf(Error);
  });

  it("is instanceof HttpError", () => {
    expect(new UnauthorizedError()).toBeInstanceOf(HttpError);
  });

  it("is instanceof ApiError", () => {
    expect(new UnauthorizedError()).toBeInstanceOf(ApiError);
  });

  it("is instanceof UnauthorizedError", () => {
    expect(new UnauthorizedError()).toBeInstanceOf(UnauthorizedError);
  });

  it("sets statusCode to 401", () => {
    expect(new UnauthorizedError().statusCode).toBe(401);
  });

  it("sets name to class name", () => {
    expect(new UnauthorizedError().name).toBe("UnauthorizedError");
  });
});

describe("ForbiddenError", () => {
  it("is instanceof ApiError and HttpError and Error", () => {
    const err = new ForbiddenError();
    expect(err).toBeInstanceOf(ForbiddenError);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toBeInstanceOf(HttpError);
    expect(err).toBeInstanceOf(Error);
  });

  it("sets statusCode to 403", () => {
    expect(new ForbiddenError().statusCode).toBe(403);
  });

  it("sets name to class name", () => {
    expect(new ForbiddenError().name).toBe("ForbiddenError");
  });
});

describe("NotFoundError", () => {
  it("is instanceof ApiError and HttpError and Error", () => {
    const err = new NotFoundError();
    expect(err).toBeInstanceOf(NotFoundError);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toBeInstanceOf(HttpError);
    expect(err).toBeInstanceOf(Error);
  });

  it("sets statusCode to 404", () => {
    expect(new NotFoundError().statusCode).toBe(404);
  });

  it("sets name to class name", () => {
    expect(new NotFoundError().name).toBe("NotFoundError");
  });
});

describe("ServiceUnavailableError", () => {
  it("is instanceof ApiError and HttpError and Error", () => {
    const err = new ServiceUnavailableError();
    expect(err).toBeInstanceOf(ServiceUnavailableError);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toBeInstanceOf(HttpError);
    expect(err).toBeInstanceOf(Error);
  });

  it("sets statusCode to 503", () => {
    expect(new ServiceUnavailableError().statusCode).toBe(503);
  });

  it("sets name to class name", () => {
    expect(new ServiceUnavailableError().name).toBe("ServiceUnavailableError");
  });
});
