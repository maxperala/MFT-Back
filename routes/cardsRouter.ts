import { Router, Response } from "express";
import { validatePostRequestForPostcards as validate } from "../utils/middleware";
import {
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
// I need to make it so that adding cards by regular users is not possible. This will be done later.
cardsRouter.use(authValidator);

cardsRouter.post("/", validate, async (req: ValidatedRequest, res, next) => {
  try {
    console.log(req.user);
    const card: NewPostcard = req.body;
    const addedCard: Postcard = await addNewCard(card);
    res.status(201).json(addedCard);
  } catch (e) {
    next(e);
  }
});

cardsRouter.get(
  "/",
  async (req: ValidatedRequest, res: Response<Postcard[]>, next) => {
    try {
      console.log(req.user);
      const cards = await getAllCards();
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
  async (req: ValidatedRequest, res: Response<UnlockedResponse>, next) => {
    try {
      const id: string = req.params.id;
      if (!id) throw new InvalidCardIdError();
      if (!req.user) throw new UserNotFoundError();
      const discovered = await discoverCard(id, req.user.id);
      res.status(200).json({
        unlocked: discovered,
      });
    } catch (e) {
      next(e);
    }
  }
);

export default cardsRouter;
