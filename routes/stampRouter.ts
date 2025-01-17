import { Router, Response } from "express";
import { authValidator } from "../utils/middleware";
import { SomeStamp, ValidatedRequest } from "../types";
import { getAllStamps } from "../services/stampService";

// Base url for this router is api/stamps
const stampRouter: Router = Router();

stampRouter.use(authValidator);

stampRouter.get(
  "/",
  async (_req: ValidatedRequest, res: Response<SomeStamp[]>, next) => {
    try {
      const stamps = await getAllStamps();
      res.status(200).json(stamps);
    } catch (e) {
      next(e);
    }
  }
);

export default stampRouter;
