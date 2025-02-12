import express, { Request, Response } from "express";
import path from "path";
import { errorHandler } from "./utils/middleware";
import { initialize, PORT } from "./utils/config";
import cardsRouter from "./routes/cardsRouter";
import userRouter from "./routes/userRouter";
import packsRouter from "./routes/packsRouter";
import stampRouter from "./routes/stampRouter";

/**
 * Main application entry point
 * Initializes Express server with routes and middleware
 * @module index
 */

// Initialize database with packs and stamps from JSON files
initialize();

const app = express();
app.use(express.json());

/**
 * Static file serving configuration
 * - Images are cached for 1 year with etag and last-modified headers
 * - Documents are served without caching
 */
app.use(
  "/images",
  express.static(path.join(__dirname, "public/images"), {
    maxAge: "1y",
    etag: true,
    lastModified: true,
  })
);
app.use("/documents", express.static(path.join(__dirname, "public/documents")));

// API routes
app.use("/api/postcards", cardsRouter);
app.use("/api/users", userRouter);
app.use("/api/packs", packsRouter);
app.use("/api/stamps", stampRouter);

/**
 * Root endpoint returns welcome message in Finnish
 */
app.get("/", (_req: Request, res: Response) => {
  res.status(200).send("Tervetuloa Muistoja Tampereelta API:hin.");
});

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log("Server running on", PORT);
});
