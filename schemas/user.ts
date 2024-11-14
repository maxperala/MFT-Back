import z from "zod";
import { model, Schema } from "mongoose";

// The app is intentionally unsecure. There is nothing in the user that would
// require for security, and I prefer to keep it this way to make the login process
// as easy as possible. The idea is that if you get a new phone etc, you can't really log in to
// the same account anymore and it does not matter in this case.
export const UserSchema = z.object({
  username: z.string().min(4).max(10),
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
      type: Number,
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

export const UserModel = model("User", mongoSchema);
