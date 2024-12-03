import { writeFile, readFile, readdir } from "node:fs/promises";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

type FilenameBuilder = (timestamp: number, uuid: string) => string;

export class FileSerializer {
  constructor(private readonly filePath: string) {
    this.initializeDirectory(filePath);
  }

  serialize(value: any): string {
    // throw new Error("Method not implemented.");

    const serialized = this.toJSON(value);
    return serialized;
  }

  deserialize<T>(value: string): T {
    // throw new Error("Method not implemented.");

    const deserialized = this.fromJSON<T>(value);
    return deserialized;
  }

  getFilePath(): string {
    return this.filePath;
  }

  async saveToFile(
    serialized: string,
    filename: string | FilenameBuilder
  ): Promise<string> {
    const date = new Date().toISOString();
    const timestamp = Date.now();
    const uuid = randomUUID();

    const fileName =
      typeof filename === "function" ? filename(timestamp, uuid) : filename;

    const filePath = join(this.filePath, fileName);

    try {
      await writeFile(filePath, serialized, { encoding: "utf-8" });
      console.log(`[${date}] Saved to file: "${filePath}"`);

      return fileName;
    } catch (error) {
      console.error(`[${timestamp}] Failed to save to file: "${filePath}"`);
      throw new Error("Failed to save to file.", { cause: error });
    }
  }

  async retrieveFromFile(filename: string): Promise<string | undefined> {
    const date = new Date().toISOString();

    const filePath = join(this.filePath, filename);

    try {
      const content = await readFile(filePath, { encoding: "utf-8" });
      console.log(`[${date}] Retrieved from file: "${filePath}"`);
      return content;
    } catch (error) {
      console.error(`[${date}] Failed to retrieve from file: "${filePath}"`);
      return undefined;
    }
  }

  async findFileName(filenamePattern: RegExp): Promise<string | null> {
    const fileNames = await readdir(this.filePath, {
      encoding: "utf-8",
    });

    const files = fileNames.filter((name) => filenamePattern.test(name));

    if (files.length === 0) {
      console.warn(`No files found for pattern "${filenamePattern}"`);
      return null;
    }

    const [first] = files.toSorted((a, b) => {
      const aTimestamp = parseInt(a.split("_")[1], 10);
      const bTimestamp = parseInt(b.split("_")[1], 10);

      return bTimestamp - aTimestamp;
    });

    console.log(`Found file: "${first}"`);

    return first;
  }

  private initializeDirectory(directory: string): void {
    try {
      mkdirSync(directory, { recursive: true });
    } catch (error) {
      console.error(`Failed to create directory: "${this.filePath}"`, error);
    }
  }

  private toJSON(value: any): string {
    return JSON.stringify(value, null, 2);
  }

  private fromJSON<T>(value: any): T {
    try {
      return JSON.parse(value);
    } catch (error) {
      const date = new Date().toISOString();
      console.error(`[${date}] Invalid JSON data: ${value}`);

      throw new Error("Invalid JSON data.", { cause: error });
    }
  }
}
