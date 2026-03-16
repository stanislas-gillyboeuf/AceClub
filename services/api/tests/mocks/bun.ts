// Mock for Bun-specific APIs when running tests with vitest (Node runtime)

export class RedisClient {
  constructor(_url: string, _opts?: Record<string, unknown>) {}
  onconnect: (() => void) | null = null;
  onclose: ((error?: Error) => void) | null = null;

  async publish(_channel: string, _message: string) {
    return 0;
  }

  async subscribe(_channel: string, _callback: (message: string) => void) {}

  async get(_key: string): Promise<string | null> {
    return null;
  }

  async set(_key: string, _value: string, _opts?: Record<string, unknown>) {}

  async del(_key: string) {
    return 0;
  }
}

export function serve(_opts: Record<string, unknown>) {
  return { port: 3000, stop: () => {} };
}
