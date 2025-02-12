import { model, Schema } from "mongoose";
import z from "zod";

/**
 * Zod schema for validating stamp data
 * @property {string} asset - URL to stamp image asset
 * @property {string} description_fi - Finnish description of the stamp
 * @property {string} description_en - English description of the stamp
 * @property {string} [pack] - Optional reference to associated pack (required for 'onCompletion' type)
 * @property {('onCompletion'|'firstTimeUse')} type - Type of stamp achievement
 * @remarks Pack reference is required when type is 'onCompletion'
 */
export const stampSchema = z
  .object({
    asset: z.string().url(),
    description_fi: z.string(),
    description_en: z.string(),
    pack: z.string().optional(),
    type: z.enum(["onCompletion", "firstTimeUse"]),
  })
  .refine((data) => {
    if (data.type === "onCompletion") {
      return data.pack !== undefined;
    }
    return true;
  });

/**
 * Mongoose schema for stamp documents
 * Includes bilingual descriptions, asset URL, type, and optional pack reference
 * Transforms _id to id in JSON responses
 */
const mongoSchema = new Schema(
  {
    asset: {
      type: String,
      required: true,
    },
    description_fi: {
      type: String,
      required: true,
    },
    description_en: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    pack: {
      type: Schema.Types.ObjectId,
      ref: "Pack",
      required: false,
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

export const StampModel = model("Stamp", mongoSchema);
