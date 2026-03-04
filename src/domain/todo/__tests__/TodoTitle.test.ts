import { describe, it, expect } from "vitest";
import { TodoTitle } from "../TodoTitle";
import { TodoTitleEmptyError, TodoTitleTooLongError } from "../TodoErrors";

describe("TodoTitle", () => {
  describe("create()", () => {
    it("creates a TodoTitle from a valid non-empty string", () => {
      const title = TodoTitle.create("Buy groceries");

      expect(title.value).toBe("Buy groceries");
    });

    it("throws TodoTitleEmptyError when given an empty string", () => {
      expect(() => TodoTitle.create("")).toThrow(TodoTitleEmptyError);
    });

    it("throws TodoTitleEmptyError when given a whitespace-only string", () => {
      expect(() => TodoTitle.create("   ")).toThrow(TodoTitleEmptyError);
    });

    it("throws TodoTitleEmptyError when given a tab-only string", () => {
      expect(() => TodoTitle.create("\t\n ")).toThrow(TodoTitleEmptyError);
    });

    it("throws TodoTitleTooLongError when title exceeds 255 characters", () => {
      const longTitle = "a".repeat(256);

      expect(() => TodoTitle.create(longTitle)).toThrow(TodoTitleTooLongError);
    });

    it("accepts a title of exactly 255 characters", () => {
      const maxTitle = "a".repeat(255);
      const title = TodoTitle.create(maxTitle);

      expect(title.value).toBe(maxTitle);
    });

    it("accepts a title of exactly 1 character", () => {
      const title = TodoTitle.create("x");

      expect(title.value).toBe("x");
    });
  });

  describe("value getter", () => {
    it("returns the underlying string value", () => {
      const title = TodoTitle.create("Write tests first");

      expect(title.value).toBe("Write tests first");
    });
  });

  describe("equals()", () => {
    it("returns true when two TodoTitles have the same value", () => {
      const a = TodoTitle.create("Same title");
      const b = TodoTitle.create("Same title");

      expect(a.equals(b)).toBe(true);
    });

    it("returns false when two TodoTitles have different values", () => {
      const a = TodoTitle.create("Title A");
      const b = TodoTitle.create("Title B");

      expect(a.equals(b)).toBe(false);
    });

    it("returns true when compared to itself", () => {
      const title = TodoTitle.create("Some title");

      expect(title.equals(title)).toBe(true);
    });
  });
});
