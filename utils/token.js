// tokens.js
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '15m';
const REFRESH_DAYS = parseInt(process.env.REFRESH_TOKEN_EXP_DAYS || '30', 10);

export const signAccessToken = (user) => {
  // Keep payload minimal
  const payload = { sub: user.id, email: user.email };
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });
}

export const verifyAccessToken = (token) => {
  return jwt.verify(token, ACCESS_SECRET);
}

export const generateRefreshTokenRaw = () => {
  return crypto.randomBytes(64).toString('hex'); // strong random token
}

export const hashToken = (token) => {
  // use sha256 hex
  return crypto.createHash('sha256').update(token).digest('hex');
}

export const refreshExpiresAt = () => {
  return new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);
}


