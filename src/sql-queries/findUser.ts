import { DatabaseSync } from "node:sqlite";

type User =
  | {
      id: number;
      name: string;
      password: string;
    }
  | undefined;

export default function findUser(userName: string) {
  const db = new DatabaseSync("storage/db.sqlite3");

  const selectUser = db.prepare("SELECT * FROM users WHERE name=?");

  const user = selectUser.get(userName) as User;
  db.close();

  return user;
}
