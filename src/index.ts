import { Config } from "./Config";
import { AocClient } from "./AocClient";

/* TODO: Add logger. */
const aoc = new AocClient(new Config().AOC_SESSION_COOKIE);

aoc.getInput(1).then(console.log).catch(console.error);

aoc.getLeaderboard(1586078).then(console.log).catch(console.error);
// aoc.getLeaderboard(360442).then(console.log).catch(console.error);
