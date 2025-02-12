import { Router, Response } from "express";
import { authValidator } from "../utils/middleware";
import { Pack, PackID, ValidatedRequest } from "../types";
import { getAllPacks, unlockPack } from "../services/packService";
import { isValidObjectId } from "mongoose";
import {
  InvalidPackIdError,
  UserNotFoundError,
} from "../utils/errors/ApiErrors";

/**
 * Router for handling pack-related endpoints
 * Base URL: /api/packs
 */
const packsRouter: Router = Router();

packsRouter.use(authValidator);

/**
 * Retrieves all available packs
 * @route GET /api/packs
 * @param {ValidatedRequest} _req - Request object (unused)
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Array of all packs
 */
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

/**
 * Unlocks a pack for the authenticated user
 * @route POST /api/packs/:id
 * @param {ValidatedRequest} req - Request with pack ID in params
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Array of user's pack IDs after unlocking
 * @throws {InvalidPackIdError} If pack ID is invalid
 * @throws {UserNotFoundError} If user is not found
 */
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
