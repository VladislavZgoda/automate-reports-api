import { mkdir } from "node:fs/promises";
import { existsSync, unlink } from "node:fs";

export async function folderExists(folderName: string) {
  if (!existsSync(folderName)) {
    await mkdir(folderName);
  }
}

export function deleteFile(filePath: string) {
  unlink(filePath, (err) => {
    if (err) {
      console.error(`Error removing file: ${err.message}`);
      console.error(err);
      return;
    }

    console.log(`File ${filePath} has been successfully removed.`);
  });
}

export function deleteFiles(...files: string[]) {
  files.forEach((file) => deleteFile(file));
}
