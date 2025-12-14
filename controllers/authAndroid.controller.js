import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


export default function createAuthController({ User, googleClient }) {
  function createTokensForUser(user) {
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    return { accessToken, refreshToken };
  }

  //  REGISTER 
  async function register(req, res) {
    try {
      const { email, password, fullName, username } = req.body;
      if (!email || !password || !fullName) {
        return res.status(400).json({ error: 'email, password and fullName required' });
      }

      const exists = await User.findOne({ email: email.toLowerCase() });
      if (exists) return res.status(409).json({ error: 'User already exists' });

      const salt = await bcrypt.genSalt(12);
      const hashed = await bcrypt.hash(password, salt);

      const user = new User({
        email: email.toLowerCase(),
        password: hashed,
        fullName,
        username
      });
      await user.save();

      const { accessToken, refreshToken } = createTokensForUser(user);
      user.refreshToken = refreshToken;
      await user.save();

      return res.json({ accessToken, refreshToken, expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' });
    } catch (err) {
      console.error('POST /auth/register error', err);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  //  LOGIN 
  async function login(req, res) {
    try {
      const { email, password, deviceInfo } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'email & password required' });

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });

      const ok = await user.isPasswordCorrect(password);
      if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

      const { accessToken, refreshToken } = createTokensForUser(user);
      user.refreshToken = refreshToken;
      await user.save();

      return res.json({ accessToken, refreshToken, expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' });
    } catch (err) {
      console.error('POST /auth/login error', err);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  //  GOOGLE SIGN-IN 
  async function googleSignIn(req, res) {
    try {
      const { idToken, deviceInfo } = req.body;
      if (!idToken) return res.status(400).json({ error: 'idToken required' });

      // verify idToken with Google
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email) return res.status(401).json({ error: 'Invalid Google token' });

      const email = payload.email.toLowerCase();
      const googleId = payload.sub;
      const fullName = payload.name || payload.given_name || 'Unknown';

      // find or create user
      let user = await User.findOne({ email });
      if (!user) {
        user = new User({
          email,
          fullName,
          googleId,
          avatar: payload.picture || undefined
        });
        await user.save();
      } else if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }

      const { accessToken, refreshToken } = createTokensForUser(user);
      user.refreshToken = refreshToken;
      await user.save();

      return res.json({ accessToken, refreshToken, expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' });
    } catch (err) {
      console.error('POST /auth/google error', err);
      return res.status(401).json({ error: 'Invalid Google token or server error' });
    }
  }

  //  REFRESH 
  async function refresh(req, res) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) return res.status(400).json({ error: 'refreshToken required' });

      let payload;
      try {
        payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      } catch (err) {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }

      const userId = payload._id || payload.sub || payload.id;
      if (!userId) return res.status(401).json({ error: 'Invalid refresh token payload' });

      const user = await User.findById(userId);
      if (!user) return res.status(401).json({ error: 'User not found' });

      if (!user.refreshToken || user.refreshToken !== refreshToken) {
        // possible token replay / stolen token
        user.refreshToken = undefined;
        await user.save().catch(() => {});
        return res.status(401).json({ error: 'Refresh token mismatch' });
      }

      const newAccess = user.generateAccessToken();
      const newRefresh = user.generateRefreshToken();

      user.refreshToken = newRefresh;
      await user.save();

      return res.json({ accessToken: newAccess, refreshToken: newRefresh, expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' });
    } catch (err) {
      console.error('POST /auth/refresh error', err);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  //  LOGOUT 
  async function logout(req, res) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.json({ ok: true });
      }

      let payload;
      try { payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET); } catch (e) { payload = null; }

      if (payload && payload._id) {
        const user = await User.findById(payload._id);
        if (user && user.refreshToken === refreshToken) {
          user.refreshToken = undefined;
          await user.save();
        }
      } else {
        const user = await User.findOne({ refreshToken: refreshToken });
        if (user) {
          user.refreshToken = undefined;
          await user.save();
        }
      }

      return res.json({ ok: true });
    } catch (err) {
      console.error('POST /auth/logout error', err);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  return {
    register,
    login,
    googleSignIn,
    refresh,
    logout,
    createTokensForUser
  };
}
