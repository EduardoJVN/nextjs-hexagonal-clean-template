export class ApplicationError extends Error {
  constructor(message: string) {
    super(message);
    // Restore prototype chain broken by TypeScript extending built-ins
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = this.constructor.name;
  }
}
