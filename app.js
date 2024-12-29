import express from "express";
import connectDB from "./database/index.js";
import passport from "passport";
import session from "express-session";
import cookieParser from "cookie-parser";
import cors from "cors";
import {
  oauthRoutes,
  userRoutes,
  channelRoutes,
  memberRoutes,
  conversationRoutes,
} from "./routes/index.js";
import logger from "./utils/logger.js";

const app = express();

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/", oauthRoutes);
app.use("/users", userRoutes);
app.use("/channel", channelRoutes);
app.use("/channel", memberRoutes);
app.use("/conversation", conversationRoutes);

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

connectDB();

export default app;