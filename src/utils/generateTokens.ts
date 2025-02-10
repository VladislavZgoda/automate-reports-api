import jsonwebtoken from "jsonwebtoken";
import type { StringValue } from "ms";

export function generateAccessToken(
  payload: string | Buffer | object,
  secretKey: string,
  expiration: number | StringValue | undefined,
) {
  const accessToken = jsonwebtoken.sign({ payload }, secretKey, {
    expiresIn: expiration,
  });

  return accessToken;
}

export function generateRefreshToken(
  payload: string | Buffer | object,
  secretKey: string,
) {
  const refreshToken = jsonwebtoken.sign({ payload }, secretKey);

  return refreshToken;
}
