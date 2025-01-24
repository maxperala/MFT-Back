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
import { addFirstUseStamps } from "../utils/stampUtils";
import { mongoDocToExposedUser } from "../utils/typeHelpers";

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
    stamps: [],
    admin: false,
  };
  /*
  Since the mongoose document is an object it is passed as a reference, meaning these functions modify the same
  instance and don't need to return anything. As far as I understand.
  */
  const newUser = new UserModel(newUserData);
  await addFreePacks(newUser);
  await addFirstUseStamps(newUser);
  await newUser.save();
  const id = newUser._id.toString();
  const payload: JwtPayload = { id };
  const token = jwt.sign(payload, SECRET);
  return mongoDocToExposedUser(newUser, token);
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
  return mongoDocToExposedUser(foundUser, token);
};

export const deleteUser = async (user: User): Promise<boolean> => {
  const deletedUser = await UserModel.findByIdAndDelete(user.id);

  if (!deletedUser) {
    throw new UserNotFoundError();
  }
  return true;
};
