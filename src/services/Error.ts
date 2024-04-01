export class GenericError extends Error {
  public code: number;

  constructor(code: number, message: string) {
    super(message);
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
  }
}

export class ClientError extends GenericError {
  constructor(message: string) {
    super(400, message);
  }
}

export class ServerError extends GenericError {
  constructor(message: string) {
    super(500, message);
  }
}
