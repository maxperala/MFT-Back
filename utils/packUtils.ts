import { UserModel } from "../schemas/user";
import { UserNotFoundError } from "./errors/ApiErrors";
import { PackModel, packSchema } from "../schemas/pack";
import { Pack } from "../types";
const packData = require("../packs.json");
import mongoose from "mongoose";

export const addFreePacks = async (
  id: mongoose.Types.ObjectId
): Promise<string[]> => {
  const user = await UserModel.findById(id);
  if (!user) throw new UserNotFoundError();
  const freePacks = await PackModel.find({ paid: false });

  for (const pack of freePacks) {
    if (!user.packs.includes(pack._id)) {
      user.packs = user.packs.concat(pack._id);
    }
  }

  await user.save();
  return user.packs.map((id) => id.toString());
};

export const loadPacksIntoDB = async () => {
  const packs: Pack[] = packData.packs;

  const allPacks = await PackModel.find({});
  const allPackNames = allPacks.map((pack) => pack.name);

  const packsToAdd = packs.filter((pack) => !allPackNames.includes(pack.name));

  if (packsToAdd.length > 0) {
    packsToAdd.forEach((pack) => packSchema.parse(pack));
    await PackModel.insertMany(packsToAdd);
    console.log(`Added ${packsToAdd.length} new packs.`);
  } else {
    console.log("No new packs to add");
  }
};
