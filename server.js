import express from "express";
import dotenv from "dotenv";
import connectDB from "./database/index.js";
import cors from "cors";
import userRouter from "./routes/user.routes.js";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/users", userRouter);


connectDB();


app.get("/", (req, res) => {
  res.send("Bingo ⚽");
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Serving on http://localhost:${PORT}`);
});
