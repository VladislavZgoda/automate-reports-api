import express from "express";
import multer from "multer";
import jsonwebtoken from "jsonwebtoken";
import {
  findToken,
  deleteToken,
  insertToken,
} from "src/sql-queries/handleTokens.ts";
import {
  generateAccessToken,
  generateRefreshToken,
} from "src/utils/generateTokens.ts";

const router = express.Router();
const upload = multer();

router.post("/refresh", upload.none(), (req, res) => {
  const refreshToken = req.body.token as string | undefined;

  if (!refreshToken) {
    res.status(401).json("You are not authenticated.");
    return;
  }

  const dbToken = findToken(refreshToken);

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

  jsonwebtoken.verify(refreshToken, secretRefreshKey, (err, payload) => {
    if (err) console.log(err);

    deleteToken(dbToken.id);

    const data = payload as { payload: { id: number }; iat: number };
    const id = data.payload.id;

    const newAccessToken = generateAccessToken({ id }, secretAccessKey, "20m");
    const newRefreshToken = generateRefreshToken({ id }, secretRefreshKey);

    insertToken(newRefreshToken);

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  });
});

export { router as refreshRoute };
