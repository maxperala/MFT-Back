import { PostcardSchema } from "./schemas/postcard";
import { UserSchema } from "./schemas/user";
import z from "zod";
import { Request } from "express";

export type NewPostcard = z.infer<typeof PostcardSchema>;

export interface Postcard extends NewPostcard {
  id: string;
}

export interface ErrorReturnForm {
  errors: string[];
}

export type NewUser = z.infer<typeof UserSchema>;

export interface User extends Omit<NewUser, "secret_code"> {
  id: string;
  secret_code_hash: string;
  lvl: number;
}

export interface ExposedUser extends Omit<User, "secret_code_hash"> {
  token: string;
}

export interface JwtPayload {
  id: string;
}

export interface ValidatedRequest extends Request {
  user?: User;
  coords?: {
    x: number;
    y: number;
    z: number;
  };
}
