import { Router, Response } from "express";
import { authValidator } from "../utils/middleware";
import { Pack, PackID, ValidatedRequest } from "../types";
import { getAllPacks, unlockPack } from "../services/packService";
import { isValidObjectId } from "mongoose";
import {
  InvalidPackIdError,
  UserNotFoundError,
} from "../utils/errors/ApiErrors";

// Base url for this router is api/packs
const packsRouter: Router = Router();

packsRouter.use(authValidator);

packsRouter.get(
  "/",
  async (_req: ValidatedRequest, res: Response<Pack[]>, next) => {
    try {
      const packs = await getAllPacks();
      console.log(packs);
      res.status(200).json(packs);
    } catch (e) {
      next(e);
    }
  }
);

packsRouter.post(
  "/:id",
  async (req: ValidatedRequest, res: Response<{ packs: PackID[] }>, next) => {
    try {
      const packId = req.params.id;
      if (!packId || !isValidObjectId(packId)) throw new InvalidPackIdError();
      if (!req.user) throw new UserNotFoundError();
      const ids: PackID[] = await unlockPack(req.user?.id, packId);
      res.status(200).json({ packs: ids });
    } catch (e) {
      next(e);
    }
  }
);

export default packsRouter;
