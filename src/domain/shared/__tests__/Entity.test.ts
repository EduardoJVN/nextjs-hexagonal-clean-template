import { describe, it, expect } from "vitest";
import { Entity } from "../Entity";

// Concrete subclass for testing (Entity is abstract)
class TestEntity extends Entity<string> {
  constructor(id: string) {
    super(id);
  }
}

class AnotherEntity extends Entity<number> {
  constructor(id: number) {
    super(id);
  }
}

describe("Entity", () => {
  describe("equals()", () => {
    it("returns true when two entities have the same id", () => {
      const a = new TestEntity("abc-123");
      const b = new TestEntity("abc-123");

      expect(a.equals(b)).toBe(true);
    });

    it("returns false when two entities have different ids", () => {
      const a = new TestEntity("abc-123");
      const b = new TestEntity("xyz-456");

      expect(a.equals(b)).toBe(false);
    });

    it("returns false when comparing to null", () => {
      const a = new TestEntity("abc-123");

      expect(a.equals(null as unknown as Entity<string>)).toBe(false);
    });

    it("returns false when comparing to undefined", () => {
      const a = new TestEntity("abc-123");

      expect(a.equals(undefined as unknown as Entity<string>)).toBe(false);
    });

    it("returns true when an entity is compared to itself", () => {
      const a = new TestEntity("abc-123");

      expect(a.equals(a)).toBe(true);
    });

    it("works with numeric ids", () => {
      const a = new AnotherEntity(1);
      const b = new AnotherEntity(1);
      const c = new AnotherEntity(2);

      expect(a.equals(b)).toBe(true);
      expect(a.equals(c)).toBe(false);
    });
  });

  describe("id", () => {
    it("exposes the id as a public property", () => {
      const entity = new TestEntity("my-id");

      expect(entity.id).toBe("my-id");
    });
  });
});
