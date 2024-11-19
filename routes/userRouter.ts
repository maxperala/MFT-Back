import { Router, Request, Response, NextFunction } from "express";
import { userValidator } from "../utils/middleware";
import { ExposedUser, NewUser } from "../types";
import { createUser, loginUser } from "../services/userService";
// Baseurl for this is /api/users
const userRouter: Router = Router();
// If additional routes are generated, this middleware need to be applied only to these 2!!
userRouter.use(userValidator);
userRouter.post(
  "/register",
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

export default userRouter;
