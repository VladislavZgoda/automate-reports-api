import { DatabaseSync } from "node:sqlite";

type User =
  | {
      id: number;
      name: string;
      password: string;
    }
  | undefined;

export function findUserByName(userName: string) {
  const db = new DatabaseSync("storage/db.sqlite3");

  const selectUser = db.prepare("SELECT * FROM users WHERE name=?");

  const user = selectUser.get(userName) as User;
  db.close();

  return user;
}

export function findUserById(id: number) {
  const db = new DatabaseSync("storage/db.sqlite3");

  const selectUser = db.prepare("SELECT * FROM users WHERE id=?");

  const user = selectUser.get(id) as User;
  db.close();

  return user;
}
