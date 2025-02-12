import { UserDocument } from "../schemas/user";
import { PackModel, packSchema } from "../schemas/pack";
import { Pack } from "../types";
import { buildUrl } from "./generalUtils";
const packData = require("../packs.json");

/**
 * Adds all free packs to a user's pack collection
 * @param {UserDocument} user - Mongoose user document to update
 * @remarks This function only updates the document in memory.
 * The document needs to be saved to MongoDB separately.
 */
export const addFreePacks = async (user: UserDocument) => {
  const freePacks = await PackModel.find({ paid: false });

  for (const pack of freePacks) {
    if (!user.packs.some((id) => id.equals(pack._id))) {
      user.packs = user.packs.concat(pack._id);
    }
  }
};

/**
 * Loads packs from JSON file into database and creates name-to-ID mapping
 * @returns {Promise<Map<string, string>>} Map of pack names to their MongoDB IDs
 * @remarks Skips packs that already exist (based on name)
 *          Updates image URLs with service base URL
 */
export const loadPacksIntoDB = async (): Promise<Map<string, string>> => {
  const packs: Pack[] = packData.packs;

  const allPacks = await PackModel.find({});
  const allPackNames = allPacks.map((pack) => pack.name);

  const packsToAdd = packs
    .filter((pack) => !allPackNames.includes(pack.name))
    .map((p) => {
      return { ...p, image_url: buildUrl(p.image_url) };
    });

  if (packsToAdd.length > 0) {
    packsToAdd.forEach((pack) => packSchema.parse(pack));
    await PackModel.insertMany(packsToAdd);
    console.log(`Added ${packsToAdd.length} new packs.`);
  } else {
    console.log("No new packs to add");
  }
  const newAllPacks = await PackModel.find({});
  const packMap = new Map<string, string>();
  for (const pack of newAllPacks) {
    packMap.set(pack.name, pack._id.toString());
  }

  return packMap;
};
