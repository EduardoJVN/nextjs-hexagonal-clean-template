export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    // Restore prototype chain broken by TypeScript extending built-ins
    Object.setPrototypeOf(this, new.target.prototype);
    // Set name to the concrete class name automatically
    this.name = new.target.name;
  }
}
