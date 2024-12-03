export enum Color {
  RED = "\x1b[31m%s\x1b[0m",
  GREEN = "\x1b[32m%s\x1b[0m",
  YELLOW = "\x1b[33m%s\x1b[0m",
  BLUE = "\x1b[34m%s\x1b[0m",
  MAGENTA = "\x1b[35m%s\x1b[0m",
  CYAN = "\x1b[36m%s\x1b[0m",
}

export class Logger {
  log(...args: any[]) {
    console.log(...args);
  }

  info(...args: any[]) {
    console.log(Color.CYAN, ...args);
  }

  success(...args: any[]) {
    console.log(Color.GREEN, ...args);
  }

  danger(...args: any[]) {
    console.log(Color.RED, ...args);
  }

  warning(...args: any[]) {
    console.log(Color.YELLOW, ...args);
  }

  message(...args: any[]) {
    console.log(Color.MAGENTA, ...args);
  }
}
