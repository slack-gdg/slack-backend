import express from "express";
import dotenv from "dotenv";
import connectDB from "./database/index.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRouter from "./routes/user.routes.js";
import passport from "passport";
import session from "express-session"
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from "./models/user.model.js";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:5000/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id })

    if (!user) {
      user = new User({
        googleId: profile.id,
        fullName: profile.displayName,
        email: profile.emails[0].value,
      });
      await user.save();
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));


passport.serializeUser((user, done) => {
  done(null, user.id);
});


passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

app.get('/', (req, res) => {
  res.send('<a href="/auth/google">Login with Google</a>');
});

app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/profile');
  }
);

app.get('/profile', (req, res) => {
  if (!req.user) {
    return res.redirect('/');
  }
  res.json({
    message: 'Welcome to your profile!',
    user: req.user
  });
});

app.get('/logout', (req, res) => {
  req.logout((err) => {
    res.redirect('/');
  });
});




app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"))
app.use(cookieParser())

app.use("/users", userRouter);


connectDB();


// app.get("/", (req, res) => {
//   res.send("Bingo ⚽");
// });

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Serving on http://localhost:${PORT}`);
});
