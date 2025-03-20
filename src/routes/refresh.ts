import express from "express";
import jsonwebtoken from "jsonwebtoken";
import { findToken } from "src/sql-queries/handleTokens.ts";
import { generateToken } from "src/utils/generateTokens.ts";
import { z } from "zod";

const refreshTokenSchema = z.object({
  token: z.string(),
})

const router = express.Router();

router.get("/refresh", (req, res) => {
  const refreshToken = refreshTokenSchema.safeParse(req.signedCookies)

  if (!refreshToken.success) {
    res.status(401).json("You are not authenticated.");
    return;
  }

  const dbToken = findToken(refreshToken.data.token);

  if (!dbToken) {
    res.status(403).json("Token is not valid.");
    return;
  }

  const secretAccessKey = process.env.SECRET_ACCESS_TOKEN;
  const secretRefreshKey = process.env.SECRET_REFRESH_TOKEN;

  if (!secretAccessKey || !secretRefreshKey) {
    res.status(500).json("Internal Server Error.");
    return;
  }

  jsonwebtoken.verify(refreshToken.data.token, secretRefreshKey, (err, payload) => {
    if (err) {
      console.log(err.name);

      res.status(403).json("Token is not valid.");
      return;
    }

    const data = payload as {
      payload: { id: number; userName: string };
      iat: number;
    };
    const userData = data.payload;

    const newAccessToken = generateToken(userData, secretAccessKey, "20m");

    res.set("Cache-Control", "no-store");

    res.status(200).json({
      accessToken: newAccessToken,
    });
  });
});

export { router as refreshRoute };
