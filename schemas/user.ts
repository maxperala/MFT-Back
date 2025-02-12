import z from "zod";
import { model, Schema } from "mongoose";

/**
 * Zod schema for user validation
 * @property {string} username - User's username (4-15 characters)
 * @property {string} secret_code - User's unhashed secret code
 */
export const UserSchema = z.object({
  username: z.string().min(4).max(15),
  secret_code: z.string(),
});

/**
 * Mongoose schema for user documents
 * @property {string} username - Unique username
 * @property {string} secret_code_hash - Hashed secret code for authentication
 * @property {object} lvl - User level information
 * @property {number} lvl.lvl - Current level number
 * @property {string} lvl.name_en - Level name in English
 * @property {string} lvl.name_fi - Level name in Finnish
 * @property {number} lvl.limit - Experience limit for current level
 * @property {ObjectId[]} unlocked - References to discovered postcards
 * @property {ObjectId[]} packs - References to unlocked packs
 * @property {ObjectId[]} stamps - References to earned stamps
 * @property {boolean} admin - Admin status flag (hidden in JSON responses)
 * @remarks Transforms MongoDB _id to id and removes admin flag in JSON responses
 */
const mongoSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    secret_code_hash: {
      type: String,
      required: true,
    },
    lvl: {
      type: {
        lvl: {
          type: Number,
          required: true,
        },
        name_en: {
          type: String,
          required: true,
        },
        name_fi: {
          type: String,
          required: true,
        },
        limit: {
          type: Number,
          required: true,
        },
      },
      required: true,
    },
    unlocked: [{ type: Schema.Types.ObjectId, ref: "Postcard" }],
    packs: [{ type: Schema.Types.ObjectId, ref: "Pack" }],
    stamps: [{ type: Schema.Types.ObjectId, ref: "Stamp" }],
    admin: {
      type: Boolean,
      required: true,
    },
  },
  {
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.admin;
      },
    },
  }
);

export const UserModel = model("User", mongoSchema);

export type UserDocument = InstanceType<typeof UserModel>;
