import z from "zod";
import { model, Schema } from "mongoose";

/**
 * The card includes a reference to the pack it belongs to.
 * Level prop is currently implemented but I'm gravitating towards
 * the final product not having levels. Just a progress on how many cards
 * have been discovered and maybe some achievements. I feel like adding
 * levels does not actually add anything to the experience.
 */
export const UserSchema = z.object({
  username: z.string().min(4).max(15),
  secret_code: z.string(),
});

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
  },
  {
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

export const UserModel = model("User", mongoSchema);
