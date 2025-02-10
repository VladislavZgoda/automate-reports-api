import { DatabaseSync } from "node:sqlite";

export function insertToken(token: string) {
  const db = new DatabaseSync("storage/db.sqlite3");

  const insertToken = db.prepare("INSERT INTO tokens (token) VALUES (?)");

  insertToken.run(token);

  db.close();
}
