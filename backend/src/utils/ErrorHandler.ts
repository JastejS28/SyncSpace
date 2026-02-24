export class ErrorHandler extends Error {
  public statusCode: number;
  public errors: any[];
  public success: boolean;

  constructor(statusCode: number, message: string, errors: any[] = [], stack: string = "") {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
    this.success = false;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}