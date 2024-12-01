import { HttpClient } from "./HttpClient";

export const BASE_URL = "https://adventofcode.com";

export class AocClient {
  private client: HttpClient;

  constructor(sessionCookie: string, userAgent?: string) {
    this.client = new HttpClient(BASE_URL, {
      headers: {
        Cookie: `session=${sessionCookie}`,
        "User-Agent": userAgent ?? "github.com/Eghizio/aoc-api",
      },
    });
  }

  getInput(
    day: number,
    year: number = new Date().getFullYear()
  ): Promise<string> {
    this.validateDay(day);

    return this.client.get(`/${year}/day/${day}/input`);
  }

  sendAnswer(
    day: number,
    part: number,
    answer: number | string,
    year: number = new Date().getFullYear()
  ): Promise<void> {
    this.validateDay(day);

    const endpoint = `/${year}/day/${day}/answer`;
    const body = new URLSearchParams({
      level: part.toString(),
      answer: answer.toString(),
    }).toString();
    const headers = { "content-type": "application/x-www-form-urlencoded" };

    return this.client.post(endpoint, body, headers);
    // https://github.com/caderek/aocrunner/blob/main/src/io/api.ts#L152
  }

  /* Todo: Add @Cache(ttl) decorator middleware? Is it needed if all GET are cached? */
  getLeaderboard(
    leaderboardId: number,
    year: number = new Date().getFullYear()
  ): Promise<Leaderboard> {
    const endpoint = `/${year}/leaderboard/private/view/${leaderboardId}.json`;
    return this.client.get(endpoint);
  }

  private validateDay(day: number): void | never {
    const isInt = Number.isInteger(day);
    const isInRange = day >= 1 && day <= 25;

    if (!isInt && !isInRange) {
      throw new Error("Day must be an integer between 1 and 25.");
    }
  }
}

type Leaderboard = {
  event: string;
  owner_id: number;
  members: Record<string, Player>;
};

type Player = {
  global_score: number;
  name: string;
  id: number;
  stars: number;
  completion_day_level: CompletionDayLevel;
  last_star_ts: number;
  local_score: number;
};

type CompletionDayLevel = Record<string, DayResult>;

type DayResult = Record<"1" | "2", PartResult>;

type PartResult = {
  star_index: number;
  get_star_ts: number;
};
