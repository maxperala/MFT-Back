import { Router } from "express";
import { authValidator, mapReqValidator } from "../utils/middleware";
import { ValidatedRequest } from "../types";
//Endpoint of this is /api/map
const mapRouter = Router();
mapRouter.use(authValidator);

/**
 * This route is supposed to fetch map tiles from Thunderforest API.
 * I was planning on using the Pioneer map.
 * This feature is ditched for now, since the Thunderforest free quota is so
 * low that using it for a free-to-use app is not feasible.
 * So, for now we shall use the default apple map in the frontend and maybe
 * design our own map tiles at some point or find a free suitable map.
 */

mapRouter.get("/:x/:y/:z", mapReqValidator, (req: ValidatedRequest, res) => {
  res.status(404).send("This service is currently unavailable");
});
