import { Router, Request, Response, NextFunction } from "express";
import { userValidator } from "../utils/middleware";
import { DeletionReturnData, ExposedUser, NewUser, ValidatedRequest } from "../types";
import { createUser, deleteUser, loginUser } from "../services/userService";
import { authValidator } from "../utils/middleware";
import { UserNotFoundError } from "../utils/errors/ApiErrors";
// Baseurl for this is /api/users
const userRouter: Router = Router();

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

userRouter.delete("/delete", authValidator, async (req: ValidatedRequest, res: Response<DeletionReturnData>, next: NextFunction) => {
  try {
    const user = req.user;
    if (!user) {
      throw new UserNotFoundError();
    }
    const deleted = await deleteUser(user);
    res.status(200).json({deleted})
  } catch (e) {
    next(e);
  }
} )

export default userRouter;
