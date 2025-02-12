import { Router, Response } from "express";
import { authValidator } from "../utils/middleware";
import { SomeStamp, ValidatedRequest } from "../types";
import { getAllStamps } from "../services/stampService";

/**
 * Router for handling stamp-related endpoints
 * Base URL: /api/stamps
 */
const stampRouter: Router = Router();

stampRouter.use(authValidator);

/**
 * Retrieves all available stamps
 * @route GET /api/stamps
 * @param {ValidatedRequest} _req - Request object (unused)
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Array of stamps
 */
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
