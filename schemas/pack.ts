import { model, Schema } from "mongoose";
import z from "zod";

/**
 * Zod schema for validating pack data
 * @property {string} name - Pack name in English (min 4 characters)
 * @property {string} name_fi - Pack name in Finnish (min 4 characters)
 * @property {string} image_url - URL for pack's image
 * @property {boolean} paid - Whether the pack requires payment to unlock
 */
export const packSchema = z.object({
  name: z.string().min(4),
  name_fi: z.string().min(4),
  image_url: z.string().url(),
  paid: z.boolean(),
});

/**
 * Mongoose schema for pack documents
 * Includes name in English and Finnish, image URL, and paid status
 * Transforms _id to id in JSON responses
 */
const mongoSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    name_fi: {
      type: String,
      required: true,
      unique: true,
    },
    image_url: {
      type: String,
      required: true,
    },
    paid: {
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
      },
    },
  }
);

export const PackModel = model("Pack", mongoSchema);
