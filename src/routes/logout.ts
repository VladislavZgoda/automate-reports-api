import express from "express";
import validateToken from "src/middleware/validateToken.ts";
import { deleteToken, findToken } from "src/sql-queries/handleTokens.ts";

const router = express.Router();

router.use(validateToken);

router.post("/logout", (req, res) => {
  const refreshToken = req.signedCookies.token as string | undefined;

  if (!refreshToken) {
    res.status(401).json("You are not authenticated.");
    return;
  }

  const dbToken = findToken(refreshToken);

  if (!dbToken) {
    res.status(403).json("Token is not valid.");
    return;
  }

  deleteToken(dbToken.id);

  res.status(200).json("You have logged out successfully.");
});

export { router as logoutRoute };
