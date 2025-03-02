import { DatabaseSync } from "node:sqlite";

export function insertToken(token: string, userId: number) {
  const db = new DatabaseSync("storage/db.sqlite3");

  const insertToken = db.prepare(
    "INSERT INTO tokens (token, user_id) VALUES (?,?)",
  );

  insertToken.run(token, userId);

  db.close();
}

type Token =
  | {
      id: number;
      token: string;
    }
  | undefined;

export function findToken(token: string) {
  const db = new DatabaseSync("storage/db.sqlite3");

  const selectToken = db.prepare("SELECT * FROM tokens WHERE token=?");
  const dbToken = selectToken.get(token) as Token;

  db.close();

  return dbToken;
}

export function deleteToken(userId: number) {
  const db = new DatabaseSync("storage/db.sqlite3");

  const deleteToken = db.prepare("DELETE FROM tokens WHERE user_id=?");
  deleteToken.run(userId);

  db.close();
}
