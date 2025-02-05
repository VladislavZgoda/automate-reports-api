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

console.info("The database has been created.");

db.close();
