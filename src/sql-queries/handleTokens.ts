import { DatabaseSync } from "node:sqlite";

export function insertToken(token: string) {
  const db = new DatabaseSync("storage/db.sqlite3");

  const insertToken = db.prepare("INSERT INTO tokens (token) VALUES (?)");

  insertToken.run(token);

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

export function deleteToken(id: number) {
  const db = new DatabaseSync("storage/db.sqlite3");

  const deleteToken = db.prepare("DELETE FROM tokens WHERE id=?");
  deleteToken.run(id);

  db.close();
}
