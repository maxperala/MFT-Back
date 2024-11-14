import express, { Request, Response } from "express";
import { errorHandler } from "./utils/middleware";
import { PORT } from "./utils/config";
import cardsRouter from "./routes/cardsRouter";
import userRouter from "./routes/userRouter";

const app = express();
app.use(express.json());
app.use("/api/postcards", cardsRouter);
app.use("/api/users", userRouter);

app.get("/", (_req: Request, res: Response) => {
  res.status(200).send("Tervetuloa Pyynikin Postikortit API:hin.");
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log("Server running on", PORT);
});
