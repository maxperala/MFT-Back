import { Router, Response } from "express";
import { validatePostRequestForPostcards as validate } from "../utils/middleware";
import { NewPostcard, Postcard } from "../types";
import { addNewCard, getAllCards } from "../services/cardService";
// The baseurl of this router is /api/postcards

const cardsRouter: Router = Router();
// Authentication is added later. Currently it will not be possible for normal users to add postcards due to copyright concerns.
cardsRouter.post("/", validate, async (req, res, next) => {
  try {
    const card: NewPostcard = req.body;
    const addedCard: Postcard = await addNewCard(card);
    res.status(201).json(addedCard);
  } catch (e) {
    next(e);
  }
});

cardsRouter.get("/", async (_req, res: Response<Postcard[]>, next) => {
  try {
    const cards = await getAllCards();
    console.log(cards);
    res.status(200).json(cards);
  } catch (e) {
    next(e);
  }
});

export default cardsRouter;
