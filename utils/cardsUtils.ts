import { UserModel } from "../schemas/user";
import { UserNotFoundError } from "./errors/ApiErrors";
import { LEVELS } from "./config";
import { Level } from "../types";

const levelUp = async (id: string, newLevel: Level): Promise<Level> => {
  const userObj = await UserModel.findByIdAndUpdate(
    id,
    { lvl: newLevel },
    { new: true }
  );
  if (!userObj) {
    throw new UserNotFoundError();
  }
  return userObj.lvl;
};

export const levelUpIfNecessary = async (
  id: string,
  currentLvl: Level,
  unlockedAmount: number
): Promise<Level> => {
  const nextLvl = LEVELS.find((l) => l.lvl === currentLvl.lvl + 1);
  let newLevel = currentLvl;

  if (nextLvl && unlockedAmount >= nextLvl.limit) {
    newLevel = await levelUp(id, nextLvl);
  }

  return newLevel;
};
