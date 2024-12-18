import z from "zod";

import { model, Schema, isValidObjectId } from "mongoose";

// We use zod-mongoose to automatically create the schema. Will change if bugs are found.
// Typescript typings are also infered from this Zod schema.

export const PostcardSchema = z.object({
  title_en: z
    .string()
    .min(3, "Please provide a title with at least 3 characters")
    .max(50, "Title too long"),
  title_fi: z
    .string()
    .min(3, "Please provide a title with at least 3 characters")
    .max(50, "Title too long"),

  description_en: z
    .string()
    .min(10, "Please provide a description of at least 10 characters"),
  description_fi: z
    .string()
    .min(10, "Please provide a description of at least 10 characters"),

  location: z.object({
    lat: z
      .number()
      .min(-90, "Latitude must be between -90 and 90")
      .max(90, "Latitude must be between -90 and 90"),

    lon: z
      .number()
      .min(-180, "Longitude must be between -180 and 180")
      .max(180, "Longitude must be between -180 and 180"),
  }),

  source: z.string().min(1, "Author name is required"),

  degree: z
    .number()
    .min(0, "Degree must be at least 0")
    .max(360, "Degree cannot exceed 360"),

  url: z.string().url("Please provide a valid URL"),
  year: z.string(),
  photographer: z.string(),
  pack: z
    .string()
    .refine((id) => isValidObjectId(id), { message: "Not a valid ObjectID" }),
});

const mongoSchema = new Schema(
  {
    title_en: {
      type: String,
      required: true,
    },
    title_fi: {
      type: String,
      required: true,
    },
    description_en: {
      type: String,
      required: true,
    },
    description_fi: {
      type: String,
      required: true,
    },
    location: {
      lat: {
        type: Number,
        required: true,
      },
      lon: {
        type: Number,
        required: true,
      },
    },
    source: {
      type: String,
      required: true,
    },
    degree: {
      type: Number,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    year: {
      type: String,
      required: true,
    },
    photographer: {
      type: String,
      required: true,
    },
    pack: {
      type: Schema.Types.ObjectId,
      ref: "Pack",
      required: true,
    },
  },
  {
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        ret.pack = ret.pack.toString();
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

//const mongoSchema = zodSchemaRaw(PostcardSchema);

export const postcardModel = model("Postcard", mongoSchema);
