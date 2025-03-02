import express from "express";
import jsonwebtoken from "jsonwebtoken";
import validateToken from "src/middleware/validateToken.ts";
import { deleteToken, findToken } from "src/sql-queries/handleTokens.ts";

type Payload = {
  payload: {
    id: number;
    userName: string;
  };
};

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

  const decodedToken = jsonwebtoken.decode(dbToken.token);
  const tokenPayload = decodedToken as Payload;

  deleteToken(tokenPayload.payload.id);

  res.status(200).json("You have logged out successfully.");
});

export { router as logoutRoute };
