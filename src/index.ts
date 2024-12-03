import { Config } from "./Config";
import { AocClient } from "./lib/AocClient";

/* TODO: Add logger. */
const aoc = new AocClient(new Config().AOC_SESSION_COOKIE);

aoc.getInput(1).catch(console.error);

aoc.getLeaderboard(1586078).catch(console.error);
aoc.getLeaderboard(360442).catch(console.error);

const minutesPassed = 0;
const interval = setInterval(() => {
  aoc
    .getLeaderboard(1586078)
    .then((d) => console.log(JSON.stringify(d)))
    .catch(console.error);

  if (minutesPassed >= 20) {
    clearInterval(interval);
  }
}, 60 * 1_000);
