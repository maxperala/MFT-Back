import mongoose from "mongoose";
import { StampModel, stampSchema } from "../schemas/stamp";
import { UserDocument, UserModel } from "../schemas/user";
import { SomeNewStamp, StampID } from "../types";
import { postcardModel } from "../schemas/postcard";
import { UserNotFoundError } from "./errors/ApiErrors";
import { buildUrl } from "./generalUtils";
const stampData = require("../stamps.json");

/**
 * Loads stamps from JSON file into database
 * @param {Map<string, string>} packMap - Map of pack names to their MongoDB IDs
 * @remarks Skips stamps that already exist (based on English description)
 */
export const loadStampsIntoDB = async (packMap: Map<string, string>) => {
  const stamps: SomeNewStamp[] = stampData.stamps;

  const allStamps = await StampModel.find({});
  const allStampDescriptions = allStamps.map((stamp) => stamp.description_en);

  let stampsToAdd = stamps.filter(
    (stamp) => !allStampDescriptions.includes(stamp.description_en)
  );
  stampsToAdd = jsonStampsToDBStamps(stampsToAdd, packMap);

  if (stampsToAdd.length > 0) {
    stampsToAdd.forEach((stamp) => stampSchema.parse(stamp));
    await StampModel.insertMany(stampsToAdd);
    console.log(`Added ${stampsToAdd.length} new stamps.`);
  } else {
    console.log("No new stamps to add");
  }
};

/**
 * Transforms stamps from JSON format to database format
 * @param {SomeNewStamp[]} stamps - Array of stamps from JSON
 * @param {Map<string, string>} packMap - Map of pack names to pack IDs
 * @returns {SomeNewStamp[]} Transformed stamps ready for database insertion
 * @throws {Error} If pack name in completion stamp doesn't exist in packMap
 */
const jsonStampsToDBStamps = (
  stamps: SomeNewStamp[],
  packMap: Map<string, string>
): SomeNewStamp[] => {
  const newStamps = stamps.map((s) => {
    const builtUrl = buildUrl(s.asset);
    if (s.type === "onCompletion" && s.pack) {
      const packID = packMap.get(s.pack);
      if (!packID) {
        throw new Error(
          `Invalid pack name ${s.pack} in stamp ${s.description_en}`
        );
      }
      return { ...s, asset: builtUrl, pack: packID };
    } else {
      return { ...s, asset: builtUrl };
    }
  });
  return newStamps;
};

/**
 * Adds first-time-use stamps to a new user's stamp collection
 * @param {UserDocument} user - Mongoose user document to update
 * @remarks This function only updates the document in memory.
 * The document needs to be saved to MongoDB separately.
 */
export const addFirstUseStamps = async (user: UserDocument) => {
  const firstTimeStamps = await StampModel.find({ type: "firstTimeUse" });
  if (firstTimeStamps.length > 0) {
    const stampIDs = firstTimeStamps.map((stamp) => stamp._id);
    user.stamps = user.stamps.concat(stampIDs);
  }
};

/**
 * Checks and awards completion stamps based on unlocked postcards
 * @param {mongoose.Types.ObjectId} userId - ID of user to check
 * @returns {Promise<StampID[]>} Array of all user's stamp IDs after update
 * @throws {UserNotFoundError} If user is not found
 * @remarks Awards stamps when all postcards in a pack are unlocked
 */
export const addStampsIfNecessary = async (
  userId: mongoose.Types.ObjectId
): Promise<StampID[]> => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new UserNotFoundError();
  }

  let possibleStamps = await StampModel.find({ type: "onCompletion" });
  possibleStamps = possibleStamps.filter(
    (stamp) => !user.stamps.includes(stamp._id)
  );
  const unlocked = user.unlocked;
  const stampsToAdd: mongoose.Types.ObjectId[] = [];
  for (const stamp of possibleStamps) {
    const allCards = await postcardModel.find({ pack: stamp.pack });
    let pass = true;
    for (const card of allCards) {
      const isUnlocked = unlocked.includes(card._id);
      if (!isUnlocked) {
        pass = false;
        break;
      }
    }
    if (pass) {
      stampsToAdd.push(stamp._id);
    }
  }
  user.stamps = user.stamps.concat(stampsToAdd);
  await user.save();

  return user.stamps.map((s) => s._id.toString());
};
