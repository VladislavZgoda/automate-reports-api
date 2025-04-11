import express from "express";
import jsonwebtoken from "jsonwebtoken";
import { findToken } from "src/sql-queries/handleTokens.ts";
import { generateToken } from "src/utils/generateTokens.ts";
import { payloadTokenSchema } from "src/validation/zodSchema.ts";
import { z } from "zod";

const refreshTokenSchema = z.object({
  token: z.string({ message: "You are not authenticated." }),
});

const router = express.Router();

router.get("/refresh", (req, res) => {
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

  const secretAccessKey = process.env.SECRET_ACCESS_TOKEN;
  const secretRefreshKey = process.env.SECRET_REFRESH_TOKEN;

  if (!secretAccessKey || !secretRefreshKey) {
    res.status(500).json("Internal Server Error.");
    return;
  }

  jsonwebtoken.verify(
    refreshToken.data.token,
    secretRefreshKey,
    (err, payload) => {
      if (err) {
        console.log(err.name);

        res.status(403).json("Token is not valid.");
        return;
      }

      const userData = payloadTokenSchema.parse(payload)
      const newAccessToken = generateToken(userData.payload, secretAccessKey, "15m");

      res.set("Cache-Control", "no-store");

      res.status(200).json({
        accessToken: newAccessToken,
      });
    },
  );
});

export { router as refreshRoute };
