import express from "express";
import http from "http";
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
  workspaceRoutes,
} from "./routes/index.js";
import logger from "./utils/logger.js";
import { SocketServiceInit } from "./services/socket-server.js";

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
app.use("/member", memberRoutes);
app.use("/workspace", workspaceRoutes);
app.use("/conversation", conversationRoutes);

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

connectDB();

const server = http.createServer(app);

SocketServiceInit(server);

export default server;
