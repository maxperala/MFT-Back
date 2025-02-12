import { Router, Response } from "express";
import {
  adminValidator,
  validatePostRequestForPostcards as validate,
} from "../utils/middleware";
import {
  DiscoverReturnData,
  NewPostcard,
  Postcard,
  UnlockedResponse,
  ValidatedRequest,
} from "../types";
import { addNewCard, discoverCard, getAllCards } from "../services/cardService";
import { authValidator } from "../utils/middleware";
import {
  InvalidCardIdError,
  UserNotFoundError,
} from "../utils/errors/ApiErrors";

/**
 * Router for handling postcard-related endpoints
 * Base URL: /api/postcards
 */
const cardsRouter: Router = Router();

cardsRouter.use(authValidator);
/*
To make someone admin, you need to manually go flip them in your mongo DB. This is okay, since I plan to have only one admin account,
and I can't see a situatuion when the app would need multiple ones
*/

/**
 * Creates a new postcard. Requires admin privileges.
 * @route POST /api/postcards
 * @param {ValidatedRequest} req - Request with validated postcard data in body
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} New postcard data
 */
cardsRouter.post(
  "/",
  adminValidator,
  validate,
  async (req: ValidatedRequest, res, next) => {
    try {
      console.log(req.user);
      const card: NewPostcard = req.body;
      const addedCard: Postcard = await addNewCard(card);
      res.status(201).json(addedCard);
    } catch (e) {
      next(e);
    }
  }
);

/**
 * Retrieves all postcards available to the user based on their packs
 * @route GET /api/postcards
 * @param {ValidatedRequest} req - Request with user data
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Array of postcards
 */
cardsRouter.get(
  "/",
  async (req: ValidatedRequest, res: Response<Postcard[]>, next) => {
    try {
      console.log(req.user);
      const cards = await getAllCards(req.user ? req.user.packs : []);
      console.log(cards);
      res.status(200).json(cards);
    } catch (e) {
      next(e);
    }
  }
);

// This route probably has no use whatsover and will be deleted in prod. Good for testing though...
/**
 * Returns list of unlocked postcards for the authenticated user
 * @route GET /api/postcards/unlocked
 * @param {ValidatedRequest} req - Request with user data
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Object containing array of unlocked postcard IDs
 */
cardsRouter.get(
  "/unlocked",
  async (req: ValidatedRequest, res: Response<UnlockedResponse>, next) => {
    try {
      if (req.user) {
        res.status(200).json({
          unlocked: req.user.unlocked,
        });
      } else {
        throw new UserNotFoundError();
      }
    } catch (e) {
      next(e);
    }
  }
);

/**
 * Marks a postcard as discovered/unlocked for the authenticated user
 * @route POST /api/postcards/unlocked/:id
 * @param {ValidatedRequest} req - Request with postcard ID in params
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Discovery status and updated user data
 * @throws {InvalidCardIdError} If postcard ID is invalid
 * @throws {UserNotFoundError} If user is not found
 */
cardsRouter.post(
  "/unlocked/:id",
  async (req: ValidatedRequest, res: Response<DiscoverReturnData>, next) => {
    try {
      const id: string = req.params.id;
      if (!id) throw new InvalidCardIdError();
      if (!req.user) throw new UserNotFoundError();
      const discovered = await discoverCard(id, req.user.id);
      res.status(200).json(discovered);
    } catch (e) {
      next(e);
    }
  }
);

export default cardsRouter;
