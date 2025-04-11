import type { NextFunction, request, response } from "express";
import { findToken } from "src/sql-queries/handleTokens.ts";
import { refreshTokenSchema } from "src/validation/zodSchema.ts";

export default function validateCookie(
  req: typeof request,
  res: typeof response,
  next: NextFunction,
) {
  const refreshToken = refreshTokenSchema.safeParse(req.signedCookies);

  if (!refreshToken.success) {
    res.status(401).json(refreshToken.error.issues[0].message);
    return;
  }

  const dbToken = findToken(refreshToken.data.token);

  if (!dbToken) {
    res.status(403).json("Token is not valid.");
    return;
  }

  next();
}
