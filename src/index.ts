import { Config } from "./Config";
import { AocClient } from "./lib/AocClient";

/* TODO: Add logger. */
const aoc = new AocClient(new Config().AOC_SESSION_COOKIE);

aoc
  .getInput(1)
  .then(() => console.log(`Got input 1`))
  .catch(console.error);

aoc
  .getLeaderboard(1586078)
  .then(() => console.log(`Got leaderboard 1586078`))
  .catch(console.error);

// aoc.getLeaderboard(360442).then(console.log).catch(console.error);

const iterationPerMinute = 6;
let counter = iterationPerMinute * 45;
const interval = setInterval(() => {
  counter--;

  aoc
    .getLeaderboard(1586078)
    .then(() => console.log(`[${counter}] Got leaderboard 1586078`))
    .catch(console.error);

  if (counter <= 0) {
    console.log("Finishing!");
    return clearInterval(interval);
  }
}, 10_000);
