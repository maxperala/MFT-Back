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
// The baseurl of this router is /api/postcards
const cardsRouter: Router = Router();

cardsRouter.use(authValidator);
/*
To make someone admin, you need to manually go flip them in your mongo DB. This is okay, since I plan to have only one admin account,
and I can't see a situatuion when the app would need multiple ones
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
// Checking for user doesn't matter at this point, since the validator does not let a bad request trough. Purely for ts stuff
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
