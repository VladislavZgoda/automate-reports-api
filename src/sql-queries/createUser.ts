import { genSaltSync, hashSync } from "bcrypt-ts";
import { DatabaseSync } from "node:sqlite";
import { argv, exit } from "node:process";

const userName = argv[2];
const userPassword = argv[3];

if (!argv[2]) {
  console.error("User name is undefined");
  exit();
}

if (!argv[3]) {
  console.error("User password is undefined");
  exit();
}

const saltRounds = 12;
const salt = genSaltSync(saltRounds);
const hashedPassword = hashSync(userPassword, salt);

const database = new DatabaseSync("storage/db.sqlite3");

const insert = database.prepare(
  "INSERT INTO users (name, password) VALUES (?, ?)",
);

insert.run(userName, hashedPassword);

database.close();
