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

/**
 * Creates a new user account with initial settings
 * @param {NewUser} user - New user data with username and secret code
 * @returns {Promise<ExposedUser>} Created user data with JWT token
 * @throws {UsernameExistsError} If username is already taken
 * @remarks Automatically adds free packs and first-use stamps to new accounts
 */
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
 * Authenticates a user and generates a JWT token
 * @param {NewUser} user - User credentials with username and secret code
 * @returns {Promise<ExposedUser>} User data with new JWT token
 * @throws {UserNotFoundError} If username is not found
 * @throws {InvalidCodeError} If secret code is incorrect
 * @remarks Free packs must be collected manually from store page, if not claimed on register
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

/**
 * Permanently deletes a user account
 * @param {User} user - User to be deleted
 * @returns {Promise<boolean>} True if deletion was successful
 * @throws {UserNotFoundError} If user is not found
 */
export const deleteUser = async (user: User): Promise<boolean> => {
  const deletedUser = await UserModel.findByIdAndDelete(user.id);

  if (!deletedUser) {
    throw new UserNotFoundError();
  }
  return true;
};
