import { model, Schema } from "mongoose";
import z from "zod";

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
