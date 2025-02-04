import { genSaltSync, hashSync } from "bcrypt-ts";
import { DatabaseSync } from "node:sqlite";
import { argv, exit } from "node:process";

type UserId =  { id: number } | undefined

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

const database = new DatabaseSync("storage/db.sqlite3");

const selectUserID = database.prepare("SELECT id FROM users WHERE name=?");
const userId = selectUserID.get(userName) as UserId;

if (!userId) {
  console.error("User not found.");
  exit();
}

const saltRounds = 12;
const salt = genSaltSync(saltRounds);
const hashedPassword = hashSync(userNewPassword, salt);

const updatePassword = database.prepare("UPDATE users SET password=? WHERE id=?");

updatePassword.run(hashedPassword, userId.id);

database.close();
