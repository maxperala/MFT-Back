import z from "zod";
import { extendZod, zodSchemaRaw } from "@zodyac/zod-mongoose";
import { model, Schema } from "mongoose";

// We use zod-mongoose to automatically create the schema. Will change if bugs are found.
// Typescript typings are also infered from this Zod schema.
extendZod(z);

export const PostcardSchema = z.object({
  title: z
    .string()
    .min(3, "Please provide a title with at least 3 characters")
    .max(100, "Title too long"),

  description: z
    .string()
    .min(10, "Please provide a description of at least 10 characters")
    .max(400, "Description too long"),

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

  author: z.string().min(1, "Author name is required"),

  degree: z
    .number()
    .min(0, "Degree must be at least 0")
    .max(360, "Degree cannot exceed 360"),

  url: z.string().url("Please provide a valid URL"),
});

const mongoSchema = zodSchemaRaw(PostcardSchema);

export const postcardModel = model(
  "Postcard",
  new Schema(mongoSchema, {
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
      },
    },
  })
);
