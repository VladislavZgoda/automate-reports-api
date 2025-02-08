import type { NextFunction, response, request } from "express";
import jsonwebtoken from "jsonwebtoken";

export default function validateToken(
  req: typeof request,
  res: typeof response,
  next: NextFunction,
) {
  const secretKey = process.env.SECRET_ACCESS_TOKEN;

  if (!secretKey) {
    res.status(500).json("Internal Server Error.");
    return;
  }

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json("You are not authenticated.");
    return;
  }

  const token = authHeader.split(" ")[1];

  jsonwebtoken.verify(token, secretKey, (err) => {
    if (err) {
      res.status(403).json("Token is not valid.");
      return;
    }

    next()
  });
}
