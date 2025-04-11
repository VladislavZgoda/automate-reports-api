import express from "express";
import jsonwebtoken from "jsonwebtoken";
import validateCookie from "src/middleware/validateCookie.ts";
import validateToken from "src/middleware/validateToken.ts";
import { deleteToken } from "src/sql-queries/handleTokens.ts";

import {
  payloadTokenSchema,
  refreshTokenSchema,
} from "src/validation/zodSchema.ts";

const router = express.Router();

router.use(validateToken);
router.use(validateCookie);

router.post("/logout", (req, res) => {
  const refreshToken = refreshTokenSchema.parse(req.signedCookies);
  const decodedToken = jsonwebtoken.decode(refreshToken.token);
  const tokenPayload = payloadTokenSchema.parse(decodedToken);

  deleteToken(tokenPayload.payload.id);

  res.status(200).json("You have logged out successfully.");
});

export { router as logoutRoute };
