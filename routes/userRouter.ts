import { Router, Request, Response, NextFunction } from "express";
import { userValidator } from "../utils/middleware";
import {
  DeletionReturnData,
  ExposedUser,
  NewUser,
  ValidatedRequest,
} from "../types";
import { createUser, deleteUser, loginUser } from "../services/userService";
import { authValidator } from "../utils/middleware";
import { UserNotFoundError } from "../utils/errors/ApiErrors";

/**
 * Router for handling user-related endpoints
 * Base URL: /api/users
 */
const userRouter: Router = Router();

/**
 * Registers a new user
 * @route POST /api/users/register
 * @param {Request} req - Request with new user data in body
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} Created user data without sensitive information
 */
userRouter.post(
  "/register",
  userValidator,
  async (
    req: Request<any, any, NewUser>,
    res: Response<ExposedUser>,
    next: NextFunction
  ) => {
    try {
      const payload: ExposedUser = await createUser(req.body);
      res.status(201).json(payload);
    } catch (e) {
      next(e);
    }
  }
);

/**
 * Authenticates a user and returns a token
 * @route POST /api/users/login
 * @param {Request} req - Request with user credentials in body
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} User data and authentication token
 */
userRouter.post(
  "/login",
  userValidator,
  async (
    req: Request<any, any, NewUser>,
    res: Response<ExposedUser>,
    next: NextFunction
  ) => {
    try {
      const user: ExposedUser = await loginUser(req.body);
      res.status(200).json(user);
    } catch (e) {
      next(e);
    }
  }
);

/**
 * Deletes the authenticated user's account
 * @route DELETE /api/users/delete
 * @param {ValidatedRequest} req - Request with authenticated user data
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} Confirmation of deletion
 * @throws {UserNotFoundError} If user is not found
 */
userRouter.delete(
  "/delete",
  authValidator,
  async (
    req: ValidatedRequest,
    res: Response<DeletionReturnData>,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      if (!user) {
        throw new UserNotFoundError();
      }
      const deleted = await deleteUser(user);
      res.status(200).json({ deleted });
    } catch (e) {
      next(e);
    }
  }
);

export default userRouter;
