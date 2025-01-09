import { ExposedUser, NewUser, User, JwtPayload } from "../types";
import { UserModel } from "../schemas/user";
import { hash, compare } from "../utils/hashing";
import jwt from "jsonwebtoken";
import { BACKUP_LEVEL, SECRET } from "../utils/config";
import {
  InvalidCodeError,
  UsernameExistsError,
  UserNotFoundError,
} from "../utils/errors/ApiErrors";
import { addFreePacks } from "../utils/packUtils";
import { LEVELS } from "../utils/config";

const zeroLevel = LEVELS.find((l) => l.lvl === 0);

export const createUser = async (user: NewUser): Promise<ExposedUser> => {
  if (await UserModel.findOne({ username: user.username })) {
    throw new UsernameExistsError();
  }
  const secret_code_hash: string = await hash(user.secret_code);
  const newUserData: Omit<User, "id"> = {
    username: user.username,
    secret_code_hash,
    lvl: zeroLevel ? zeroLevel : BACKUP_LEVEL,
    unlocked: [],
    packs: [],
  };
  // This part currently makes 2 db calls (one more in addFreePacks). I should refactor it so it does only one
  const newUser = new UserModel(newUserData);
  await newUser.save();
  const packs = await addFreePacks(newUser._id);
  const id = newUser._id.toString();
  const payload: JwtPayload = { id };
  const token = jwt.sign(payload, SECRET);
  return {
    id,
    username: newUser.username,
    lvl: newUser.lvl,
    token,
    unlocked: [],
    packs: packs,
  };
};

/**
 * I could check if new free packs are available on each login/start of app.
 * But it feels more special IMO if the user needs to go and collect it from the store page (to be implemented later)
 */
export const loginUser = async (user: NewUser): Promise<ExposedUser> => {
  const foundUser = await UserModel.findOne({
    username: user.username,
  });
  if (!foundUser) throw new UserNotFoundError();
  const res = await compare(user.secret_code, foundUser.secret_code_hash);
  if (!res) throw new InvalidCodeError();
  const id = foundUser._id.toString();
  const payload: JwtPayload = { id };
  const token = jwt.sign(payload, SECRET);
  return {
    id,
    username: foundUser.username,
    lvl: foundUser.lvl,
    token,
    unlocked: foundUser.unlocked.map((id) => id.toString()),
    packs: foundUser.packs.map((id) => id.toString()),
  };
};
