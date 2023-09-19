import express from "express";
import cors from "cors";
import { BASE_PATH } from "./config";
import rootRouter from "./routes";
import { errorHandler } from "./middlewares/errorHandler";
import helmet from "helmet";
import { notFound } from "./middlewares/notFound";

// dotenv
import "dotenv/config";

const app = express();

const PORT = process.env.PORT || 8000;

// middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// routes
app.use(BASE_PATH, rootRouter);

// 404 error handling
app.use(notFound);
// custom error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running or port ${PORT}`);
});
