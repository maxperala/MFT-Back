import express from "express";
import { PORT } from "./utils/config";

const app = express();

app.get("/", (_req, res) => {
    res.status(200).send("Tervetuloa Pyynikin Postikortit API:hin.");
})


app.listen(PORT, () => {
  console.log("Server running on", PORT);
});
