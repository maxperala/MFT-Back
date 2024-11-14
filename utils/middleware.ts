import { NextFunction, Request, Response } from "express";
import { PostcardSchema } from "../schemas/postcard";
import { UserSchema } from "../schemas/user";
import { ZodError } from "zod";
import { ErrorReturnForm, NewPostcard, NewUser } from "../types";
import { UsernameExistsError } from "./errors/ApiErrors";

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

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response<ErrorReturnForm>,
  _next: NextFunction
) => {
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

  res.status(500).json({
    errors: ["An unknown error occurred"],
  });
};

export const userCreationValidator = (
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
