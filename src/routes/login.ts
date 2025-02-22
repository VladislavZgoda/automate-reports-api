import { compareSync } from "bcrypt-ts";
import express from "express";
import bodyParser from "body-parser";
import findUser from "src/sql-queries/findUser.ts";
import { insertToken } from "src/sql-queries/handleTokens.ts";
import { generateToken } from "src/utils/generateTokens.ts";

const router = express.Router();

router.post(
  "/login",
  bodyParser.json(),
  (req, res, next) => {
    if (!req.body?.login || !req.body?.password) {
      res.status(400).json("Login or password is missing.");
      return;
    }

    next();
  },
  (req, res) => {
    const { login, password }: { login: string; password: string } = req.body;

    const user = findUser(login);

    if (!user) {
      res.status(401).json("Login or password incorrect.");
      return;
    }

    if (!compareSync(password, user.password)) {
      res.status(401).json("Login or password incorrect.");
      return;
    }

    const secretAccessKey = process.env.SECRET_ACCESS_TOKEN;
    const secretRefreshKey = process.env.SECRET_REFRESH_TOKEN;

    if (!secretAccessKey || !secretRefreshKey) {
      res.status(500).json("Internal Server Error.");
      return;
    }

    const payload = { id: user.id, userName: user.name };

    const accessToken = generateToken(payload, secretAccessKey, "15m");
    const refreshToken = generateToken(payload, secretRefreshKey, "24h");

    insertToken(refreshToken);

    res.cookie("token", refreshToken, {
      httpOnly: true,
      signed: true,
      maxAge: 3 * 86400,
      sameSite: 'strict'
    });

    res.status(200).json({
      accessToken,
    });
  },
);

export { router as loginRoute };
