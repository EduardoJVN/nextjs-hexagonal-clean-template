/**
 * HTTP Error Hierarchy
 *
 * HttpError (base)
 *   ├── NetworkError       — connection-level failures (statusCode: 0)
 *   └── ApiError           — server returned a 4xx/5xx response (parsed body)
 *         ├── UnauthorizedError    (401)
 *         ├── ForbiddenError       (403)
 *         ├── NotFoundError        (404)
 *         └── ServiceUnavailableError (503)
 */

export class HttpError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ApiError extends HttpError {
  constructor(
    statusCode: number,
    public readonly body?: unknown,
  ) {
    super(`API error: ${statusCode}`, statusCode);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NetworkError extends HttpError {
  constructor(message: string, cause?: unknown) {
    super(message, 0);
    this.name = this.constructor.name;
    this.cause = cause;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class UnauthorizedError extends ApiError {
  constructor() {
    super(401);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ForbiddenError extends ApiError {
  constructor() {
    super(403);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends ApiError {
  constructor() {
    super(404);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ServiceUnavailableError extends ApiError {
  constructor() {
    super(503);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
