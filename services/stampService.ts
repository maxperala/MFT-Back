import { StampModel } from "../schemas/stamp";
import { SomeStamp, StampType } from "../types";

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
