/**
 * Port: IHttpClient
 *
 * Defines the contract that any HTTP client adapter must satisfy.
 * Domain and application layers depend on this abstraction — never on fetch directly.
 */
export interface IHttpClient {
  get<T>(path: string, options?: RequestInit): Promise<T>;
  post<T>(path: string, body: unknown, options?: RequestInit): Promise<T>;
  put<T>(path: string, body: unknown, options?: RequestInit): Promise<T>;
  patch<T>(path: string, body: unknown, options?: RequestInit): Promise<T>;
  delete(path: string, options?: RequestInit): Promise<void>;
}
