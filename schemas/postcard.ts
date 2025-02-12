import z from "zod";

import { model, Schema, isValidObjectId } from "mongoose";

/**
 * Zod schema for validating postcard data
 * @property {string} title_en - English title (3-50 characters)
 * @property {string} title_fi - Finnish title (3-50 characters)
 * @property {string} description_en - English description (min 10 characters)
 * @property {string} description_fi - Finnish description (min 10 characters)
 * @property {object} location - Geographic coordinates
 * @property {number} location.lat - Latitude (-90 to 90)
 * @property {number} location.lon - Longitude (-180 to 180)
 * @property {string} source - Author/source of the postcard
 * @property {number} degree - Rotation degree (0-360)
 * @property {string} url - URL to postcard image
 * @property {string} year - Year of the postcard
 * @property {string} photographer - Photographer's name (empty string if unknown)
 * @property {string} pack - MongoDB ObjectId reference to associated pack
 */
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

/**
 * Mongoose schema for postcard documents
 * Includes bilingual titles and descriptions, location data, metadata, and pack reference
 * Transforms _id to id and pack reference to string in JSON responses
 */
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
    // I'm currently using empty strings if the photographer is uknown. This is maybe not the 'best' practice, but works. I also need the field to still be present because the frontend is designed that way
    photographer: {
      type: String,
      default: "",
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

export const postcardModel = model("Postcard", mongoSchema);
