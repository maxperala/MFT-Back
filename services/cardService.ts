import { DiscoverReturnData, NewPostcard, Postcard } from "../types";
import { postcardModel } from "../schemas/postcard";
import {
  InvalidCardIdError,
  UserNotFoundError,
} from "../utils/errors/ApiErrors";
import { UserModel } from "../schemas/user";
import { isValidObjectId } from "mongoose";
import { levelUpIfNecessary } from "../utils/cardsUtils";
import { addStampsIfNecessary } from "../utils/stampUtils";

/**
 * Creates a new postcard in the database
 * @param {NewPostcard} card - New postcard data to be saved
 * @returns {Promise<Postcard>} Created postcard with generated ID
 */
export const addNewCard = async (card: NewPostcard): Promise<Postcard> => {
  const newPostcard = new postcardModel(card);
  await newPostcard.save();
  // I did not figure out how to make this without this conversion first. The obj structure is correct.
  const obj = newPostcard.toJSON() as unknown;
  return obj as Postcard;
};

/**
 * Retrieves all postcards that belong to the specified packs
 * @param {string[]} packs - Array of pack IDs to filter postcards by
 * @returns {Promise<Postcard[]>} Array of postcards from the specified packs
 */
export const getAllCards = async (packs: string[]): Promise<Postcard[]> => {
  const res = await postcardModel.find({ pack: { $in: packs } });
  return res.map((i) => {
    const item = i.toJSON() as unknown;
    return item as Postcard;
  });
};

/**
 * Marks a postcard as discovered for a user and handles related updates
 * @param {string} id - ID of the postcard to discover
 * @param {string} userId - ID of the user discovering the postcard
 * @returns {Promise<DiscoverReturnData>} Updated user data including unlocked cards, new level, and new stamps
 * @throws {InvalidCardIdError} If postcard ID is invalid or not found
 * @throws {UserNotFoundError} If user is not found
 */
export const discoverCard = async (
  id: string,
  userId: string
): Promise<DiscoverReturnData> => {
  if (!isValidObjectId(id)) throw new InvalidCardIdError();
  const card = await postcardModel.findById(id);
  if (!card) throw new InvalidCardIdError();
  const user = await UserModel.findById(userId);
  if (!user) throw new UserNotFoundError();

  if (!user.unlocked.includes(card._id)) {
    user.unlocked = [...user.unlocked, card._id];
    await user.save();
  }
  const lvl = await levelUpIfNecessary(
    user._id.toString(),
    user.lvl,
    user.unlocked.length
  );
  const stamps = await addStampsIfNecessary(user._id);
  return {
    discovered: user.unlocked.map((id) => id.toString()),
    newLevel: lvl,
    newStamps: stamps,
  };
};
