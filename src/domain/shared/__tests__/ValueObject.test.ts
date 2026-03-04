import { describe, it, expect } from "vitest";
import { ValueObject } from "../ValueObject";

interface NameProps {
  firstName: string;
  lastName: string;
}

interface AmountProps {
  value: number;
  currency: string;
}

class Name extends ValueObject<NameProps> {
  constructor(props: NameProps) {
    super(props);
  }

  get firstName(): string {
    return this.props.firstName;
  }

  get lastName(): string {
    return this.props.lastName;
  }
}

class Amount extends ValueObject<AmountProps> {
  constructor(props: AmountProps) {
    super(props);
  }
}

describe("ValueObject", () => {
  describe("equals()", () => {
    it("returns true when two value objects have the same props", () => {
      const a = new Name({ firstName: "John", lastName: "Doe" });
      const b = new Name({ firstName: "John", lastName: "Doe" });

      expect(a.equals(b)).toBe(true);
    });

    it("returns false when two value objects have different props", () => {
      const a = new Name({ firstName: "John", lastName: "Doe" });
      const b = new Name({ firstName: "Jane", lastName: "Doe" });

      expect(a.equals(b)).toBe(false);
    });

    it("compares by value not by reference", () => {
      const props = { firstName: "John", lastName: "Doe" };
      const a = new Name(props);
      const b = new Name({ ...props }); // different object reference, same values

      expect(a).not.toBe(b); // different references
      expect(a.equals(b)).toBe(true); // but equal by value
    });

    it("returns false when comparing to null", () => {
      const a = new Name({ firstName: "John", lastName: "Doe" });

      expect(a.equals(null as unknown as ValueObject<NameProps>)).toBe(false);
    });

    it("returns false when comparing to undefined", () => {
      const a = new Name({ firstName: "John", lastName: "Doe" });

      expect(
        a.equals(undefined as unknown as ValueObject<NameProps>),
      ).toBe(false);
    });

    it("returns true when a value object is compared to itself", () => {
      const a = new Name({ firstName: "John", lastName: "Doe" });

      expect(a.equals(a)).toBe(true);
    });

    it("handles numeric prop comparison correctly", () => {
      const a = new Amount({ value: 100, currency: "USD" });
      const b = new Amount({ value: 100, currency: "USD" });
      const c = new Amount({ value: 200, currency: "USD" });

      expect(a.equals(b)).toBe(true);
      expect(a.equals(c)).toBe(false);
    });

    it("detects difference in a single nested prop", () => {
      const a = new Amount({ value: 100, currency: "USD" });
      const b = new Amount({ value: 100, currency: "EUR" });

      expect(a.equals(b)).toBe(false);
    });
  });

  describe("props", () => {
    it("exposes props as protected (accessible via getter)", () => {
      const vo = new Name({ firstName: "John", lastName: "Doe" });

      expect(vo.firstName).toBe("John");
      expect(vo.lastName).toBe("Doe");
    });
  });
});
