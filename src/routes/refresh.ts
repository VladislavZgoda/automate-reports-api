import express from "express";
import jsonwebtoken from "jsonwebtoken";
import validateCookie from "src/middleware/validateCookie.ts";
import { generateToken } from "src/utils/generateTokens.ts";

import {
  payloadTokenSchema,
  refreshTokenSchema,
} from "src/validation/zodSchema.ts";

const router = express.Router();

router.use(validateCookie);

router.get("/refresh", (req, res) => {
  const secretAccessKey = process.env.SECRET_ACCESS_TOKEN;
  const secretRefreshKey = process.env.SECRET_REFRESH_TOKEN;

  if (!secretAccessKey || !secretRefreshKey) {
    res.status(500).json("Internal Server Error.");
    return;
  }

  const refreshToken = refreshTokenSchema.parse(req.signedCookies);

  jsonwebtoken.verify(refreshToken.token, secretRefreshKey, (err, payload) => {
    if (err) {
      console.log(err.name);

      res.status(403).json("Token is not valid.");
      return;
    }

    const userData = payloadTokenSchema.parse(payload);

    const newAccessToken = generateToken(
      userData.payload,
      secretAccessKey,
      "15m",
    );

    res.set("Cache-Control", "no-store");

    res.status(200).json({
      accessToken: newAccessToken,
    });
  });
});

export { router as refreshRoute };
