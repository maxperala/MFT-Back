import { StampModel } from "../schemas/stamp";
import { SomeStamp, StampType } from "../types";

/**
 * Retrieves all stamps from the database and formats them based on their type
 * @returns {Promise<SomeStamp[]>} Array of stamps with formatted IDs and fields
 * @remarks For 'onCompletion' type stamps, includes pack reference
 *          For other types, excludes pack reference
 */
export const getAllStamps = async (): Promise<SomeStamp[]> => {
  const stamps = await StampModel.find({});
  return stamps.map((stamp) => {
    switch (stamp.type) {
      case "onCompletion":
        return {
          id: stamp._id.toString(),
          asset: stamp.asset,
          description_fi: stamp.description_fi,
          description_en: stamp.description_en,
          type: stamp.type as StampType,
          pack: stamp.pack?.toString(),
        };
      default:
        return {
          id: stamp._id.toString(),
          asset: stamp.asset,
          description_fi: stamp.description_fi,
          description_en: stamp.description_en,
          type: stamp.type as StampType,
        };
    }
  });
};
