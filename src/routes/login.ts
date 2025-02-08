import { compareSync } from "bcrypt-ts";
import jsonwebtoken from "jsonwebtoken";
import express from "express";
import multer from "multer";
import findUser from "src/sql-queries/findUser.ts";

const router = express.Router();
const upload = multer();

router.post(
  "/login",
  upload.none(),
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

    const secretKey = process.env.SECRET_ACCESS_TOKEN;

    if (!secretKey) {
      res.status(500).json("Internal Server Error.");
      return;
    }

    const token = jsonwebtoken.sign({ id: user.id }, secretKey, {
      expiresIn: "20m",
    });

    res.status(200).json({
      token,
    });
  },
);

export { router as loginRoute };
