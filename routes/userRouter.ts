import { Router, Request, Response } from "express";
import { userCreationValidator } from "../utils/middleware";
import { ExposedUser, NewUser } from "../types";
import { createUser } from "../services/userService";
// Baseurl for this is /api/users
const userRouter: Router = Router();

userRouter.post(
  "/register",
  userCreationValidator,
  async (req: Request<any, any, NewUser>, res: Response, next) => {
    try {
      const payload: ExposedUser = await createUser(req.body);
      res.status(201).json(payload);
    } catch (e) {
      next(e);
    }
  }
);

export default userRouter;
