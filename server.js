import express from "express";
import dotenv from "dotenv";
import connectDB from "./database/index.js";

dotenv.config();
const app = express();

connectDB();

app.get("/", (req, res) => {
    res.send("Bingo ⚽");
})

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Serving on http://localhost:${PORT}`);
});
