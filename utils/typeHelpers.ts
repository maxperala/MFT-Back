import { UserDocument } from "../schemas/user";
import { ExposedUser, User } from "../types";
import { MAPBOX_PUBLIC_KEY } from "./config";

/**
 * Converts a Mongoose user document to an exposed user object with JWT token
 * @param {UserDocument} doc - Mongoose user document to convert
 * @param {string} token - JWT token for authentication
 * @returns {ExposedUser} User data safe for client exposure, including token and map key
 * @remarks Converts ObjectIds to strings and adds Mapbox API key
 */
export const mongoDocToExposedUser = (
  doc: UserDocument,
  token: string
): ExposedUser => {
  return {
    id: doc._id.toString(),
    username: doc.username,
    lvl: doc.lvl,
    token,
    unlocked: doc.unlocked.map((v) => v.toString()),
    packs: doc.packs.map((v) => v.toString()),
    stamps: doc.stamps.map((v) => v.toString()),
    mapkey: MAPBOX_PUBLIC_KEY,
  };
};

/**
 * Converts a Mongoose user document to an internal user object
 * @param {UserDocument} user - Mongoose user document to convert
 * @returns {User} User data for internal use, including admin status
 * @remarks Converts ObjectIds to strings but retains sensitive data like hash and admin status
 */
export const mongoDocToUser = (user: UserDocument): User => {
  return {
    id: user._id.toString(),
    username: user.username,
    lvl: user.lvl,
    secret_code_hash: user.secret_code_hash,
    unlocked: user.unlocked.map((id) => id.toString()),
    packs: user.packs.map((id) => id.toString()),
    stamps: user.stamps.map((id) => id.toString()),
    admin: user.admin,
  };
};
