import { DatabaseSync } from "node:sqlite";
import { argv, exit } from "node:process";
import selectUserID from "./selectUserId.ts";

const currentUserName = argv[2];
const newUserName = argv[3];

if (!argv[2]) {
  console.error("Current user name is undefined.");
  exit();
}

if (!argv[3]) {
  console.error("New user name is undefined.");
  exit();
}

const db = new DatabaseSync("storage/db.sqlite3");
const userId = selectUserID(db, currentUserName);

if (!userId) {
  console.error("User not found.");
  exit();
}

const updateName = db.prepare("UPDATE users SET name=? WHERE id=?");
updateName.run(newUserName, userId.id);
console.info(`${currentUserName} changed to ${newUserName}`);

db.close();
