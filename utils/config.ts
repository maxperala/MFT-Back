import mongoose from "mongoose";
import { Secret } from "jsonwebtoken";
import { Level, LevelData } from "../types";
import { loadCardsIntoDB } from "./cardsUtils";
import { loadStampsIntoDB } from "./stampUtils";
import { loadPacksIntoDB } from "./packUtils";
const lvlData: LevelData = require("../levels.json");
// Set MODE variable to ENV in package.json if you wish to use a dotenv file :)
if (process.env.MODE === "dev") {
  const dotenv = require("dotenv");
  dotenv.config();
}

const PORT: number = Number(process.env.PORT);
if (isNaN(PORT)) throw new Error("Please provide a valid PORT variable!");
let DB_KEY: string;
if (process.env.DB_KEY) {
  DB_KEY = process.env.DB_KEY;
} else {
  throw new Error("Please provide a DB Key!");
}

mongoose.connect(DB_KEY).then(() => {
  console.log("Connected to MongoDB");
});
if (!process.env.SECRET) throw new Error("Please provide a secret variable!");
const SECRET: Secret = process.env.SECRET;

const LEVELS: Level[] = lvlData.levels;

const BACKUP_LEVEL: Level = {
  lvl: 0,
  name_fi: "Muukalainen",
  name_en: "Stranger",
  limit: 0,
};

export const initialize = async () => {
  try {
    await loadCardsIntoDB();
    await loadPacksIntoDB();
    await loadStampsIntoDB();
  } catch (e) {
    console.log(e);
    throw new Error("Failed to initialize the database, check syntax of data json files and try again!");
  }

  
  
}

export { PORT, DB_KEY, SECRET, LEVELS, BACKUP_LEVEL };
