import express from "express";
import jsonwebtoken from "jsonwebtoken";
import validateToken from "src/middleware/validateToken.ts";
import { deleteToken, findToken } from "src/sql-queries/handleTokens.ts";
import { z } from "zod";

const refreshTokenSchema = z.object({
  token: z.string({ message: "You are not authenticated." }),
});

const payloadTokenSchema = z.object({
  payload: z.object({
    id: z.number(),
    userName: z.string(),
  }),
});

const router = express.Router();

router.use(validateToken);

router.post("/logout", (req, res) => {
  const refreshToken = refreshTokenSchema.safeParse(req.signedCookies);

  if (!refreshToken.success) {
    res.status(401).json(refreshToken.error.message);
    return;
  }

  const dbToken = findToken(refreshToken.data.token);

  if (!dbToken) {
    res.status(403).json("Token is not valid.");
    return;
  }

  const decodedToken = jsonwebtoken.decode(dbToken.token);
  const tokenPayload = payloadTokenSchema.parse(decodedToken);

  deleteToken(tokenPayload.payload.id);

  res.status(200).json("You have logged out successfully.");
});

export { router as logoutRoute };
