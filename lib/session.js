import jwt from "jsonwebtoken";
import cookie from "cookie";

const COOKIE_NAME = "arketype_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT secret missing. Set JWT_SECRET in your environment.");
  }
  return secret;
}

export function createSessionToken(payload) {
  return jwt.sign(payload, getSecret(), { expiresIn: MAX_AGE_SECONDS });
}

export function verifySessionToken(token) {
  try {
    return jwt.verify(token, getSecret());
  } catch (error) {
    return null;
  }
}

export function setSessionCookie(res, token) {
  res.setHeader(
    "Set-Cookie",
    cookie.serialize(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: MAX_AGE_SECONDS,
      path: "/",
    })
  );
}

export function clearSessionCookie(res) {
  res.setHeader(
    "Set-Cookie",
    cookie.serialize(COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(0),
      path: "/",
    })
  );
}

export function getSessionFromRequest(req) {
  const cookies = cookie.parse(req.headers.cookie || "");
  if (!cookies[COOKIE_NAME]) {
    return null;
  }
  return verifySessionToken(cookies[COOKIE_NAME]);
}
