import { NewPostcard, Postcard } from "../types";
import { postcardModel } from "../schemas/postcard";

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
