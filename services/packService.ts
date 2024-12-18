import { PackModel } from "../schemas/pack";
import { UserModel } from "../schemas/user";
import { Pack } from "../types";
import {
  InvalidPackIdError,
  UserNotFoundError,
} from "../utils/errors/ApiErrors";

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
