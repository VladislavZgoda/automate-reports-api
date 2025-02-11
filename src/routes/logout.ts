import express from "express";
import multer from "multer";
import validateToken from "src/middleware/validateToken.ts";
import { deleteToken, findToken } from "src/sql-queries/handleTokens.ts";

const router = express.Router();
const upload = multer();

router.use(validateToken);

router.post("/logout", upload.none(), (req, res) => {
  const bodyErrMessage = "To log out, you must send a refresh token.";

  if (!req.body) {
    res.status(400).json(bodyErrMessage);
    return;
  }

  const token = req.body.token as string | undefined;

  if (!token) {
    res.status(400).json(bodyErrMessage);
    return;
  }

  const refreshToken = findToken(token);

  if (!refreshToken) {
    res.status(403).json("Token does not exist.");
    return;
  }

  deleteToken(refreshToken.id);

  res.status(200).json("You have logged out successfully.");
});

export { router as logoutRoute };
