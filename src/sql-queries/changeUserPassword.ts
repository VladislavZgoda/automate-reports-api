import { genSaltSync, hashSync } from "bcrypt-ts";
import { DatabaseSync } from "node:sqlite";
import { argv, exit } from "node:process";
import selectUserID from "./selectUserId.ts";

const userName = argv[2];
const userNewPassword = argv[3];

if (!argv[2]) {
  console.error("User name is undefined.");
  exit();
}

if (!argv[3]) {
  console.error("User password is undefined.");
  exit();
}

const db = new DatabaseSync("storage/db.sqlite3");
const userId = selectUserID(db, userName);

if (!userId) {
  console.error("User not found.");
  exit();
}

const saltRounds = 12;
const salt = genSaltSync(saltRounds);
const hashedPassword = hashSync(userNewPassword, salt);

const updatePassword = db.prepare("UPDATE users SET password=? WHERE id=?");
updatePassword.run(hashedPassword, userId.id);
console.info("Password changed.");

db.close();
