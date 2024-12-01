export class Config {
  readonly AOC_SESSION_COOKIE: string;

  constructor() {
    this.AOC_SESSION_COOKIE = this.getEnv("AOC_SESSION_COOKIE");
  }

  private getEnv<T>(key: string, defaultValue?: T): string | T {
    const value = process.env[key];

    if (value) return value;

    if (defaultValue) return defaultValue;

    throw new Error(`No environment variable "${key}" found.`);
  }
}
