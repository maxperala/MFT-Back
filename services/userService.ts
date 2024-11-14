import { ExposedUser, NewUser, User, JwtPayload } from "../types";
import { UserModel } from "../schemas/user";
import { hash } from "../utils/hashing";
import jwt from "jsonwebtoken";
import { SECRET } from "../utils/config";
import { UsernameExistsError } from "../utils/errors/ApiErrors";

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
