import { ExposedUser, NewUser, User, JwtPayload } from "../types";
import { UserModel } from "../schemas/user";
import { hash, compare } from "../utils/hashing";
import jwt from "jsonwebtoken";
import { SECRET } from "../utils/config";
import {
  UsernameExistsError,
  UserNotFoundError,
} from "../utils/errors/ApiErrors";

export const createUser = async (user: NewUser): Promise<ExposedUser> => {
  if (await UserModel.findOne({ username: user.username })) {
    throw new UsernameExistsError();
  }

  const secret_code_hash: string = await hash(user.secret_code);
  const newUserData: Omit<User, "id"> = {
    username: user.username,
    secret_code_hash,
    lvl: 0,
  };
  const newUser = new UserModel(newUserData);
  await newUser.save();
  const id = newUser._id.toString();
  const payload: JwtPayload = { id };
  const token = jwt.sign(payload, SECRET);
  return {
    id,
    username: newUser.username,
    lvl: newUser.lvl,
    token,
  };
};

export const loginUser = async (user: NewUser): Promise<ExposedUser> => {
  const foundUser = await UserModel.findOne({ username: user.username });
  if (!foundUser) throw new UserNotFoundError();
  const res = await compare(user.secret_code, foundUser.secret_code_hash);
  if (!res) throw new UserNotFoundError();
  const id = foundUser._id.toString();
  const payload: JwtPayload = { id };
  const token = jwt.sign(payload, SECRET);
  return {
    id,
    username: foundUser.username,
    lvl: foundUser.lvl,
    token,
  };
};
