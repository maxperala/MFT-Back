import { UserDocument } from "../schemas/user";
import { PackModel, packSchema } from "../schemas/pack";
import { Pack } from "../types";
const packData = require("../packs.json");

/*
This function just updates the document and the actual document needs to be saved to mongo elsewhere!
*/
export const addFreePacks = async (user: UserDocument) => {
  const freePacks = await PackModel.find({ paid: false });

  for (const pack of freePacks) {
    if (!user.packs.some((id) => id.equals(pack._id))) {
      user.packs = user.packs.concat(pack._id);
    }
  }
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
