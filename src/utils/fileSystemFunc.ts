import { existsSync, rm, unlink } from "node:fs";
import { mkdir } from "node:fs/promises";

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

export function deleteDir(dirPath: string) {
  rm(dirPath, { recursive: true }, (err) => {
    if (err) {
      throw err;
    }

    console.log(`Dir ${dirPath} has been successfully removed.`);
  });
}
