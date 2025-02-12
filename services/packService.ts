import { PackModel } from "../schemas/pack";
import { UserModel } from "../schemas/user";
import { Pack } from "../types";
import {
  InvalidPackIdError,
  UserNotFoundError,
} from "../utils/errors/ApiErrors";

/**
 * Retrieves all available packs from the database
 * @returns {Promise<Pack[]>} Array of packs with formatted IDs and fields
 */
export const getAllPacks = async (): Promise<Pack[]> => {
  const packs = await PackModel.find({});
  return packs.map((pack) => {
    return {
      id: pack._id.toString(),
      name: pack.name,
      name_fi: pack.name_fi,
      image_url: pack.image_url,
      paid: pack.paid,
    };
  });
};

/**
 * Unlocks a pack for a specific user
 * @param {string} userID - ID of the user unlocking the pack
 * @param {string} packID - ID of the pack to unlock
 * @returns {Promise<string[]>} Array of pack IDs that the user has unlocked
 * @throws {UserNotFoundError} If user is not found
 * @throws {InvalidPackIdError} If pack is not found
 * @throws {Error} If attempting to unlock a paid pack (not implemented)
 * @remarks Paid pack functionality is not yet implemented
 */
export const unlockPack = async (userID: string, packID: string) => {
  const user = await UserModel.findById(userID);
  if (!user) throw new UserNotFoundError();
  const pack = await PackModel.findById(packID);
  if (!pack) throw new InvalidPackIdError();

  if (pack.paid) {
    /**
     * Here will be implemented the app store recipt checking logic if paid packs are implemented at some point :D
     */
    throw new Error("Paid packs not implemented");
  }
  // Not really worth throwing an error here, this should not even be possible in production.
  if (user.packs.includes(pack._id)) {
    return user.packs.map((id) => id.toString());
  }

  user.packs = user.packs.concat(pack._id);
  await user.save();
  return user.packs.map((id) => id.toString());
};
