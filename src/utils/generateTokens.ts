import jsonwebtoken from "jsonwebtoken";
import type { StringValue } from "ms";

export function generateToken(
  payload: string | Buffer | object,
  secretKey: string,
  expiration: number | StringValue | undefined,
) {
  const accessToken = jsonwebtoken.sign({ payload }, secretKey, {
    expiresIn: expiration,
  });

  return accessToken;
}
