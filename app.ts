import express from "express";
import cors from "cors";
import { BASE_PATH, PUBLIC_DIR_NAME, STATIC_PATH } from "./config";
import rootRouter from "./routes";
import { errorHandler } from "./middlewares/errorHandler";
import helmet from "helmet";
import { notFound } from "./middlewares/notFound";
import path from "path";

// dotenv
import "dotenv/config";

const app = express();

const PORT = process.env.PORT || 8000;

// middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(cors());
app.use(express.json());

// static files -> eg: /api/v1/static -> points to /public dir
app.use(
  BASE_PATH + STATIC_PATH,
  express.static(path.join(__dirname, PUBLIC_DIR_NAME))
);

// routes
app.use(BASE_PATH, rootRouter);

// 404 error handling
app.use(notFound);
// custom error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running or port ${PORT}`);
});
