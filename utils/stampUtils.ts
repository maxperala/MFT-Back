import mongoose from "mongoose";
import { StampModel, stampSchema } from "../schemas/stamp";
import { UserModel } from "../schemas/user";
import { SomeNewStamp, StampID } from "../types";
import { postcardModel } from "../schemas/postcard";
import { UserNotFoundError } from "./errors/ApiErrors";
const stampData = require("../stamps.json");

export const loadStampsIntoDB = async () => {
  const stamps: SomeNewStamp[] = stampData.stamps;

  const allStamps = await StampModel.find({});
  const allPackDescriptions = allStamps.map((stamp) => stamp.description_en);

  const stampsToAdd = stamps.filter(
    (stamp) => !allPackDescriptions.includes(stamp.description_en)
  );

  if (stampsToAdd.length > 0) {
    stampsToAdd.forEach((stamp) => stampSchema.parse(stamp));
    await StampModel.insertMany(stampsToAdd);
    console.log(`Added ${stampsToAdd.length} new stamps.`);
  } else {
    console.log("No new stamps to add");
  }
};

export const addFirstUseStamps = async (id: mongoose.Types.ObjectId) => {
  const user = await UserModel.findById(id);
  const firstTimeStamps = await StampModel.find({ type: "firstTimeUse" });
  if (user && firstTimeStamps) {
    const stampIDs = firstTimeStamps.map((stamp) => stamp._id);
    user.stamps = user.stamps.concat(stampIDs);
    await user.save();
    return user.stamps.map((s) => s.toString());
  }
  return [];
};

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
    // PostcardModel should be capitalized, I will fix later
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
