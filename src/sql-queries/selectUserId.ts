import type { DatabaseSync } from "node:sqlite";

type UserId = { id: number } | undefined;

export default function selectUserID(db: DatabaseSync, userName: string) {
  const selectUserID = db.prepare("SELECT id FROM users WHERE name=?");
  const userId = selectUserID.get(userName) as UserId;

  return userId;
}
