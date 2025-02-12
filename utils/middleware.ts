import { NextFunction, Request, Response } from "express";
import { PostcardSchema } from "../schemas/postcard";
import { UserModel, UserSchema } from "../schemas/user";
import { ZodError } from "zod";
import {
  ErrorReturnForm,
  NewPostcard,
  NewUser,
  ValidatedRequest,
  CardID,
} from "../types";
import {
  InvalidCardIdError,
  InvalidCodeError,
  NotAdminError,
  UsernameExistsError,
  UserNotFoundError,
} from "./errors/ApiErrors";
import jwt from "jsonwebtoken";
import { SECRET } from "./config";
import { mongoDocToUser } from "./typeHelpers";

/**
 * Validates postcard data in request body against PostcardSchema
 * @param {Request} req - Express request with postcard data
 * @param {Response} _res - Express response (unused)
 * @param {NextFunction} next - Express next middleware function
 */
export const validatePostRequestForPostcards = (
  req: Request<any, any, NewPostcard>,
  _res: Response,
  next: NextFunction
) => {
  try {
    PostcardSchema.parse(req.body);
    next();
  } catch (e) {
    next(e);
  }
};

/**
 * Global error handler middleware
 * @param {unknown} error - Error to be handled
 * @param {Request} _req - Express request (unused)
 * @param {Response} res - Express response
 * @param {NextFunction} _next - Express next middleware function (unused)
 * @returns {Response} Error response with appropriate status code and message
 */
export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response<ErrorReturnForm>,
  _next: NextFunction
) => {
  // Maybe refactor this to a switch case... and implement some better logging
  console.log(error);
  if (error instanceof ZodError) {
    return res.status(400).json({
      errors: error.errors.map((e) => `Argument ${e.path[0]}: ${e.message}`),
    });
  }
  if (error instanceof UsernameExistsError) {
    return res.status(400).json({
      errors: [error.message],
    });
  }
  if (error instanceof NotAdminError) {
    return res.status(401).json({
      errors: ["This action is restricted to administrators."],
    });
  }
  if (
    error instanceof UserNotFoundError ||
    error instanceof InvalidCodeError ||
    error instanceof InvalidCardIdError
  ) {
    return res.status(401).json({
      errors: [error.message],
    });
  }

  res.status(500).json({
    errors: ["An unknown error occurred"],
  });
};

/**
 * Validates user data in request body against UserSchema
 * @param {Request} req - Express request with user data
 * @param {Response} _res - Express response (unused)
 * @param {NextFunction} next - Express next middleware function
 */
export const userValidator = (
  req: Request<any, any, NewUser>,
  _res: Response,
  next: NextFunction
) => {
  try {
    UserSchema.parse(req.body);
    next();
  } catch (e) {
    next(e);
  }
};

/**
 * Validates JWT token and adds user data to request
 * @param {ValidatedRequest} req - Express request with authorization header
 * @param {Response} _res - Express response (unused)
 * @param {NextFunction} next - Express next middleware function
 * @throws {UserNotFoundError} If token is missing or user not found
 */
export const authValidator = async (
  req: ValidatedRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    if (
      !req.headers.authorization ||
      !req.headers.authorization.startsWith("Bearer ")
    ) {
      throw new UserNotFoundError();
    }

    const token = req.headers.authorization.split(" ")[1];
    const payload = jwt.verify(token, SECRET);
    // This should not happen, so it's ok to handle it as a general error and just log it.
    if (typeof payload === "string")
      throw new Error("JWT verification failed.");

    let user = await UserModel.findById(payload.id);
    if (!user) throw new UserNotFoundError();
    req.user = mongoDocToUser(user);
    next();
  } catch (e) {
    next(e);
  }
};

/**
 * Validates that the user has admin privileges
 * @param {ValidatedRequest} req - Express request with user data
 * @param {Response} _res - Express response (unused)
 * @param {NextFunction} next - Express next middleware function
 * @throws {UserNotFoundError} If user is not found
 * @throws {NotAdminError} If user is not an admin
 */
export const adminValidator = (
  req: ValidatedRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    if (!user) {
      throw new UserNotFoundError();
    }
    if (!user.admin) {
      throw new NotAdminError();
    }
    next();
  } catch (e) {
    next(e);
  }
};

/**
 * Validates card unlock request parameters
 * @param {ValidatedRequest} req - Express request with card ID
 * @param {Response} _res - Express response (unused)
 * @param {NextFunction} next - Express next middleware function
 * @throws {InvalidCardIdError} If card ID is missing
 * @remarks May be refactored in future
 */
export const unlockRequestValidator = (
  req: ValidatedRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const cardId: CardID | undefined = req.params.id;
    if (!cardId) {
      throw new InvalidCardIdError();
    }
  } catch (e) {
    next(e);
  }
};
