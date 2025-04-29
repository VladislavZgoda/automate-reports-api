import { compareSync } from "bcrypt-ts";
import bodyParser from "body-parser";
import express from "express";
import findUser from "src/sql-queries/findUser.ts";
import { deleteToken, insertToken } from "src/sql-queries/handleTokens.ts";
import { generateToken } from "src/utils/generateTokens.ts";
import { z } from "zod";

const requestBodySchema = z.object({
  login: z.string(),
  password: z.string(),
});

const router = express.Router();

router.post(
  "/login",
  bodyParser.json(),
  (req, res, next) => {
    if (!requestBodySchema.safeParse(req.body).success) {
      res.status(400).json("Login or password is missing.");
      return;
    }

    next();
  },
  (req, res) => {
    const { login, password } = requestBodySchema.parse(req.body);

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

    deleteToken(user.id);
    insertToken(refreshToken, user.id);

    res.cookie("token", refreshToken, {
      httpOnly: true,
      signed: true,
      maxAge: 86400000, // Один день в мс
      sameSite: "strict",
    });

    res.status(200).json({
      accessToken,
    });
  },
);

export { router as loginRoute };
