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

export type NewPack = Omit<Pack, "id">;

export interface Pack {
  id: string;
  name: string;
  name_fi: string;
  image_url: string;
  paid: boolean;
}

export type StampType = "onCompletion" | "firstTimeUse";

export interface FirstTimeStamp {
  id: string;
  asset: string;
  description_fi: string;
  description_en: string;
  type: StampType;
}

export interface OnCompletionStamp extends FirstTimeStamp {
  pack: string;
}
export interface SomeNewStamp extends Omit<FirstTimeStamp, "id"> {
  pack?: string;
}
export interface SomeStamp extends SomeNewStamp {
  id: string;
}

export interface User extends Omit<NewUser, "secret_code"> {
  id: string;
  secret_code_hash: string;
  lvl: Level;
  unlocked: CardID[];
  packs: PackID[];
  stamps: StampID[];
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

export type CardID = string;

export type PackID = string;

export type StampID = string;

export interface UnlockedResponse {
  unlocked: CardID[];
}

export interface Level {
  lvl: number;
  name_fi: string;
  name_en: string;
  limit: number;
}

export interface LevelData {
  levels: Level[];
}

export interface DiscoverReturnData {
  discovered: string[];
  newLevel: Level;
  newStamps: StampID[];
}
