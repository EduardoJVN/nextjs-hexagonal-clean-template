import { describe, it, expect } from "vitest";
import { DomainError } from "../DomainError";

// Concrete subclass for testing
class UserNotFoundError extends DomainError {
  constructor(userId: string) {
    super(`User with id ${userId} not found`);
  }
}

class ValidationError extends DomainError {
  constructor(field: string) {
    super(`Validation failed for field: ${field}`);
  }
}

describe("DomainError", () => {
  describe("message", () => {
    it("preserves the message passed to the constructor", () => {
      const error = new UserNotFoundError("user-42");

      expect(error.message).toBe("User with id user-42 not found");
    });

    it("handles interpolated messages correctly", () => {
      const error = new ValidationError("email");

      expect(error.message).toBe("Validation failed for field: email");
    });
  });

  describe("name", () => {
    it("sets name to the concrete class name automatically", () => {
      const error = new UserNotFoundError("user-1");

      expect(error.name).toBe("UserNotFoundError");
    });

    it("reflects each concrete subclass name individually", () => {
      const validationError = new ValidationError("title");

      expect(validationError.name).toBe("ValidationError");
    });
  });

  describe("instanceof", () => {
    it("is an instance of Error", () => {
      const error = new UserNotFoundError("user-1");

      expect(error).toBeInstanceOf(Error);
    });

    it("is an instance of DomainError", () => {
      const error = new UserNotFoundError("user-1");

      expect(error).toBeInstanceOf(DomainError);
    });

    it("is an instance of the concrete subclass", () => {
      const error = new UserNotFoundError("user-1");

      expect(error).toBeInstanceOf(UserNotFoundError);
    });
  });

  describe("stack trace", () => {
    it("has a stack property (indicating proper Error extension)", () => {
      const error = new UserNotFoundError("user-1");

      expect(error.stack).toBeDefined();
    });
  });
});
