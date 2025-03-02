import { DatabaseSync } from "node:sqlite";
import { folderExists } from "src/utils/fileSystemFunc.ts";

await folderExists("storage");

const db = new DatabaseSync("storage/db.sqlite3");

db.exec(`
  CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS tokens(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT UNIQUE NOT NULL,
    user_id INTEGER NOT NULL,
    CONSTRAINT tokens_users_fk,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  )
`);

console.info("The database has been created.");

db.close();
