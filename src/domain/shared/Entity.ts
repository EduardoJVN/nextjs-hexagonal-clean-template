export abstract class Entity<T> {
  public readonly id: T;

  constructor(id: T) {
    this.id = id;
  }

  public equals(other: Entity<T> | null | undefined): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    if (!(other instanceof Entity)) {
      return false;
    }
    return this.id === other.id;
  }
}
