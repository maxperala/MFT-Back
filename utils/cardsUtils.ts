import { UserModel } from "../schemas/user";
import { UserNotFoundError } from "./errors/ApiErrors";
import { LEVELS } from "./config";
import { Level, NewPostcard } from "../types";
import { postcardModel, PostcardSchema } from "../schemas/postcard";
const cardData = require("../cards.json");

const levelUp = async (id: string, newLevel: Level): Promise<Level> => {
  const userObj = await UserModel.findByIdAndUpdate(
    id,
    { lvl: newLevel },
    { new: true }
  );
  if (!userObj) {
    throw new UserNotFoundError();
  }
  return userObj.lvl;
};

export const levelUpIfNecessary = async (
  id: string,
  currentLvl: Level,
  unlockedAmount: number
): Promise<Level> => {
  const nextLvl = LEVELS.find((l) => l.lvl === currentLvl.lvl + 1);
  let newLevel = currentLvl;

  if (nextLvl && unlockedAmount >= nextLvl.limit) {
    newLevel = await levelUp(id, nextLvl);
  }

  return newLevel;
};


export const loadCardsIntoDB = async () => {
  const cards: NewPostcard[] = cardData.cards;

  const allCards = await postcardModel.find({});
  const alreadyAddedCardTitles = allCards.map((card) => card.title_en);

  const cardsToAdd = cards.filter((card) => !alreadyAddedCardTitles.includes(card.title_en));

  if (cardsToAdd.length > 0) {
    cardsToAdd.forEach((card) => PostcardSchema.parse(card));
    await postcardModel.insertMany(cardsToAdd);
    console.log(`Added ${cardsToAdd.length} new cards.`);
  } else {
    console.log("No new cards to add");
  }

}