import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";

export async function folderExists(folderName: string) {
  if (!existsSync(folderName)) {
    await mkdir(folderName);
  }
}
