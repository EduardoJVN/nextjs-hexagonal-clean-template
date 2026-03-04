import { describe, it, expect } from "vitest";
import { AggregateRoot } from "../AggregateRoot";
import { DomainEvent } from "../DomainEvent";

// Concrete event for testing
class UserRegistered implements DomainEvent {
  readonly occurredOn: Date;
  readonly eventName = "UserRegistered";

  constructor(public readonly userId: string) {
    this.occurredOn = new Date();
  }
}

class OrderPlaced implements DomainEvent {
  readonly occurredOn: Date;
  readonly eventName = "OrderPlaced";

  constructor(public readonly orderId: string) {
    this.occurredOn = new Date();
  }
}

// Concrete aggregate for testing
class TestAggregate extends AggregateRoot<string> {
  constructor(id: string) {
    super(id);
  }

  doSomething(): void {
    this.addDomainEvent(new UserRegistered(this.id));
  }

  doAnotherThing(): void {
    this.addDomainEvent(new OrderPlaced("order-1"));
  }
}

describe("AggregateRoot", () => {
  describe("addDomainEvent()", () => {
    it("stores a domain event", () => {
      const aggregate = new TestAggregate("agg-1");
      aggregate.doSomething();

      const events = aggregate.pullDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe("UserRegistered");
    });

    it("stores multiple domain events in order", () => {
      const aggregate = new TestAggregate("agg-1");
      aggregate.doSomething();
      aggregate.doAnotherThing();

      const events = aggregate.pullDomainEvents();
      expect(events).toHaveLength(2);
      expect(events[0].eventName).toBe("UserRegistered");
      expect(events[1].eventName).toBe("OrderPlaced");
    });
  });

  describe("pullDomainEvents()", () => {
    it("returns the accumulated events", () => {
      const aggregate = new TestAggregate("agg-1");
      aggregate.doSomething();

      const events = aggregate.pullDomainEvents();
      expect(events).toHaveLength(1);
    });

    it("clears events after pulling", () => {
      const aggregate = new TestAggregate("agg-1");
      aggregate.doSomething();

      aggregate.pullDomainEvents(); // first pull
      const eventsAfter = aggregate.pullDomainEvents(); // second pull

      expect(eventsAfter).toHaveLength(0);
    });

    it("returns empty array when no events have been added", () => {
      const aggregate = new TestAggregate("agg-1");

      const events = aggregate.pullDomainEvents();
      expect(events).toHaveLength(0);
    });

    it("returns a copy so external mutation does not affect internal state", () => {
      const aggregate = new TestAggregate("agg-1");
      aggregate.doSomething();

      const events = aggregate.pullDomainEvents();
      events.push(new OrderPlaced("mutated")); // mutate the returned array

      // internal should still be empty after pull
      const eventsAfterMutation = aggregate.pullDomainEvents();
      expect(eventsAfterMutation).toHaveLength(0);
    });
  });

  describe("inheritance from Entity", () => {
    it("supports identity equality via equals()", () => {
      const a = new TestAggregate("agg-1");
      const b = new TestAggregate("agg-1");
      const c = new TestAggregate("agg-2");

      expect(a.equals(b)).toBe(true);
      expect(a.equals(c)).toBe(false);
    });
  });
});
