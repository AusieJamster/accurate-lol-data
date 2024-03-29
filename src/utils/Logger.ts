export default class Logger {
  constructor(
    private readonly isDebug: boolean = false,
    private readonly requestId: string
  ) {}

  debug(...msg: unknown[]) {
    if (this.isDebug) console.log(this.requestId, ...msg);
  }

  log(...msg: unknown[]) {
    console.log(this.requestId, ...msg);
  }

  warn(...msg: unknown[]) {
    console.warn(this.requestId, ...msg);
  }

  error(...msg: unknown[]) {
    console.error(this.requestId, ...msg);
  }
}
