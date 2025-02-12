import { UserModel } from "../schemas/user";
import { UserNotFoundError } from "./errors/ApiErrors";
import { LEVELS } from "./config";
import { Level, NewPostcard } from "../types";
import { postcardModel, PostcardSchema } from "../schemas/postcard";
import { buildUrl } from "./generalUtils";
const cardData = require("../cards.json");

/**
 * Updates user's level in the database
 * @param {string} id - User ID
 * @param {Level} newLevel - New level data to set
 * @returns {Promise<Level>} Updated level information
 * @throws {UserNotFoundError} If user is not found
 */
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

/**
 * Checks and updates user's level based on number of unlocked cards
 * @param {string} id - User ID
 * @param {Level} currentLvl - User's current level
 * @param {number} unlockedAmount - Number of cards user has unlocked
 * @returns {Promise<Level>} Updated or current level information
 */
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

/**
 * Loads new cards from JSON file into database
 * @param {Map<string, string>} packMap - Map of pack names to pack IDs
 * @remarks Skips cards that already exist (based on English title)
 */
export const loadCardsIntoDB = async (packMap: Map<string, string>) => {
  const cards: NewPostcard[] = cardData.cards;

  const allCards = await postcardModel.find({});
  const alreadyAddedCardTitles = allCards.map((card) => card.title_en);

  let cardsToAdd = cards.filter(
    (card) => !alreadyAddedCardTitles.includes(card.title_en)
  );
  cardsToAdd = jsonCardsToDBCards(cardsToAdd, packMap);

  if (cardsToAdd.length > 0) {
    cardsToAdd.forEach((card) => PostcardSchema.parse(card));
    await postcardModel.insertMany(cardsToAdd);
    console.log(`Added ${cardsToAdd.length} new cards.`);
  } else {
    console.log("No new cards to add");
  }
};

/**
 * Transforms cards from JSON format to database format
 * @param {NewPostcard[]} cards - Array of cards from JSON
 * @param {Map<string, string>} packMap - Map of pack names to pack IDs
 * @returns {NewPostcard[]} Transformed cards ready for database insertion
 * @throws {Error} If pack name in card doesn't exist in packMap
 */
const jsonCardsToDBCards = (
  cards: NewPostcard[],
  packMap: Map<string, string>
): NewPostcard[] => {
  const newCards = cards.map((c) => {
    const packID = packMap.get(c.pack);
    const builtUrl = buildUrl(c.url);
    if (!packID) {
      throw new Error(`Invalid pack name ${c.pack} in card ${c.title_en}`);
    }

    return { ...c, pack: packID, url: builtUrl };
  });
  return newCards;
};
