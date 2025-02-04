import { DatabaseSync } from "node:sqlite";
import { folderExists } from "src/utils/fileSystemFunc.ts";

await folderExists("storage");

const database = new DatabaseSync("storage/db.sqlite3");

database.exec(`
  CREATE TABLE IF NOT EXISTS Users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    passwords TEXT NOT NULL
  )
`);

database.close();
