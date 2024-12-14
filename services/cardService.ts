import { NewPostcard, Postcard } from "../types";
import { postcardModel } from "../schemas/postcard";
import {
  InvalidCardIdError,
  UserNotFoundError,
} from "../utils/errors/ApiErrors";
import { UserModel } from "../schemas/user";
import { isValidObjectId } from "mongoose";

export const addNewCard = async (card: NewPostcard): Promise<Postcard> => {
  const newPostcard = new postcardModel(card);
  await newPostcard.save();
  // I did not figure out how to make this without this conversion first. The obj structure is correct.
  const obj = newPostcard.toJSON() as unknown;
  return obj as Postcard;
};

export const getAllCards = async (): Promise<Postcard[]> => {
  const res = await postcardModel.find({});
  return res.map((i) => {
    const item = i.toJSON() as unknown;
    return item as Postcard;
  });
};

export const discoverCard = async (
  id: string,
  userId: string
): Promise<string[]> => {
  if (!isValidObjectId(id)) throw new InvalidCardIdError();
  const card = await postcardModel.findById(id);
  if (!card) throw new InvalidCardIdError();
  const user = await UserModel.findById(userId);
  if (!user) throw new UserNotFoundError();

  if (!user.unlocked.includes(card._id)) {
    user.unlocked = [...user.unlocked, card._id];
    await user.save();
  }
  return user.unlocked.map((id) => id.toString());
};
