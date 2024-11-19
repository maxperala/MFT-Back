export class InvalidDegreesError extends Error {
  constructor() {
    super("Degrees of image direction must be 0 < deg <= 360");
    this.name = "InvalidDegreesError";
  }
}

export class InvalidUrlError extends Error {
  constructor(msg: string) {
    super(`Invalid URL Error: ${msg}`);
    this.name = "InvalidUrlError";
  }
}

export class UsernameExistsError extends Error {
  constructor() {
    super("Username already taken");
    this.name = "UsernameExistsError";
  }
}

export class UserNotFoundError extends Error {
  constructor() {
    super("User not found");
    this.name = "UserNotFoundError";
  }
}

export class InvalidMapRequestError extends Error {
  constructor() {
    super("Invalid coordinates");
    this.name = "InvalidMapRequest";
  }
}
