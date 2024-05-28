export class CustomError extends Error {
  constructor(options) {
    super(options.message || options.cause || String(options));
    this.name = options.name || "Error";
    this.code = options.code || 500;
    if (options.cause) {
      this.stack += `\nCaused by: ${options.cause}`;
    }
  }
}
