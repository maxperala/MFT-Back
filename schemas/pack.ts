import { model, Schema } from "mongoose";
import z from "zod";

export const packSchema = z.object({
  name: z.string().min(4),
  name_fi: z.string().min(4),
  image_url: z.string().url(),
  paid: z.boolean(),
});

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
