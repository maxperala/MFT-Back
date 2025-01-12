import express, { Request, Response } from "express";
import path from "path";
import { errorHandler } from "./utils/middleware";
import { PORT } from "./utils/config";
import cardsRouter from "./routes/cardsRouter";
import userRouter from "./routes/userRouter";
import { loadPacksIntoDB } from "./utils/packUtils";
import packsRouter from "./routes/packsRouter";

// Used to load the pack data from the JSON file into Mongo. If there are new packs.
loadPacksIntoDB();
const app = express();
app.use(express.json());
app.use(
  "/images",
  express.static(path.join(__dirname, "public/images"), {
    maxAge: "1y",
    etag: true,
    lastModified: true,
  })
);
app.use("/api/postcards", cardsRouter);
app.use("/api/users", userRouter);
app.use("/api/packs", packsRouter);

app.get("/", (_req: Request, res: Response) => {
  res.status(200).send("Tervetuloa Pyynikin Postikortit API:hin.");
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log("Server running on", PORT);
});
