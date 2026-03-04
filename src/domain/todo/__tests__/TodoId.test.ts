import { describe, it, expect } from "vitest";
import { TodoId } from "../TodoId";

describe("TodoId", () => {
  describe("create()", () => {
    it("generates a non-empty string id", () => {
      const id = TodoId.create();

      expect(typeof id.value).toBe("string");
      expect(id.value.length).toBeGreaterThan(0);
    });

    it("generates unique ids on each call", () => {
      const a = TodoId.create();
      const b = TodoId.create();

      expect(a.value).not.toBe(b.value);
    });

    it("generates a valid UUID v4 format", () => {
      const id = TodoId.create();
      const uuidV4Regex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      expect(uuidV4Regex.test(id.value)).toBe(true);
    });
  });

  describe("fromString()", () => {
    it("creates a TodoId from a valid non-empty string", () => {
      const id = TodoId.fromString("abc-123");

      expect(id.value).toBe("abc-123");
    });

    it("throws when given an empty string", () => {
      expect(() => TodoId.fromString("")).toThrow();
    });

    it("throws when given a whitespace-only string", () => {
      expect(() => TodoId.fromString("   ")).toThrow();
    });

    it("throws an error with a descriptive message on empty input", () => {
      expect(() => TodoId.fromString("")).toThrow("TodoId cannot be empty");
    });
  });

  describe("value getter", () => {
    it("returns the underlying string value", () => {
      const id = TodoId.fromString("my-todo-id");

      expect(id.value).toBe("my-todo-id");
    });
  });

  describe("equals()", () => {
    it("returns true when two TodoIds have the same value", () => {
      const a = TodoId.fromString("same-id");
      const b = TodoId.fromString("same-id");

      expect(a.equals(b)).toBe(true);
    });

    it("returns false when two TodoIds have different values", () => {
      const a = TodoId.fromString("id-one");
      const b = TodoId.fromString("id-two");

      expect(a.equals(b)).toBe(false);
    });

    it("returns true when compared to itself", () => {
      const a = TodoId.fromString("my-id");

      expect(a.equals(a)).toBe(true);
    });
  });
});
