import { Cache } from "./Cache";
import { Logger } from "./Logger";

type Options = RequestInit;
type HttpMethod = Options["method"];
type Body = Options["body"];
type Headers = Options["headers"];

export class HttpClient {
  private readonly baseURL: string;
  private readonly defaultHeaders: Headers;
  private readonly defaultOptions: Options;
  private cache: Cache;
  private logger: Logger;

  constructor(
    baseURL: string,
    {
      headers,
      options,
      cache,
    }: { headers?: Headers; options?: Options; cache?: Cache },
    logger = new Logger()
  ) {
    this.baseURL = baseURL;
    this.defaultHeaders = headers ?? {};
    this.defaultOptions = options ?? {};
    this.cache = cache ?? new Cache({ logger });
    this.logger = logger;
  }

  async get(endpoint: string, headers?: Headers) {
    if (this.cache.has(endpoint)) return this.cache.get(endpoint);

    this.logger.info(`Fetching ${endpoint}`);
    const value = await this.request(endpoint, "GET", undefined, headers);

    this.cache.set(endpoint, value);

    return value;
  }

  async post(endpoint: string, body: Body, headers?: Headers) {
    return this.request(endpoint, "POST", body, headers);
  }

  async patch(endpoint: string, body: Body, headers?: Headers) {
    return this.request(endpoint, "PATCH", body, headers);
  }

  async put(endpoint: string, body: Body, headers?: Headers) {
    return this.request(endpoint, "PUT", body, headers);
  }

  async delete(endpoint: string) {
    return this.request(endpoint, "DELETE");
  }

  private async request(
    endpoint: string,
    method: HttpMethod = "GET",
    body?: Body,
    headers?: Headers
  ) {
    const url = `${this.baseURL}${endpoint}`;
    const options = this.#createOptions(method, body, headers);

    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(
        `Response was not OK. Status: ${response.status} ${response.statusText}`
      );
    }

    const contentType = response.headers.get("Content-Type");

    if (contentType?.includes("application/json")) {
      const data = await response.json();
      return data;
    }

    const data = await response.text();
    return data;
  }

  #createOptions(method: HttpMethod, body: Body, headers: Headers) {
    const options = {
      ...this.defaultOptions,
      method,
      headers: this.defaultHeaders,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    if (headers) {
      options.headers = { ...options.headers, ...headers };
    }

    return options;
  }
}
