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
  InvalidMapRequestError,
  UsernameExistsError,
  UserNotFoundError,
} from "./errors/ApiErrors";
import jwt from "jsonwebtoken";
import { SECRET } from "./config";

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
    req.user = {
      id: user._id.toString(),
      username: user.username,
      lvl: user.lvl,
      secret_code_hash: user.secret_code_hash,
      unlocked: user.unlocked.map((id) => id.toString()),
      packs: user.packs.map((id) => id.toString()),
      stamps: user.stamps.map((id) => id.toString()),
    };
    next();
  } catch (e) {
    next(e);
  }
};
// This one is unusable for now, and probably unecessary
export const mapReqValidator = (
  req: ValidatedRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const { x, y, z } = req.params;
    const xnum = parseFloat(x);
    const ynum = parseFloat(y);
    const znum = parseFloat(z);
    if ((isNaN(xnum), isNaN(ynum), isNaN(znum))) {
      throw new InvalidMapRequestError();
    }
    req.coords = {
      x: xnum,
      y: ynum,
      z: znum,
    };
  } catch (e) {
    next(e);
  }
};

// Probably the id can't be extracted before the route itself... I leave this here anyways incase needed later
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
