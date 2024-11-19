import { Router, Response } from "express";
import { validatePostRequestForPostcards as validate } from "../utils/middleware";
import { NewPostcard, Postcard, ValidatedRequest } from "../types";
import { addNewCard, getAllCards } from "../services/cardService";
import { authValidator } from "../utils/middleware";
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

export default cardsRouter;
