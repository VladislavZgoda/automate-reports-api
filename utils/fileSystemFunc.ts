import { mkdir } from "node:fs/promises";
import { existsSync, unlink } from "node:fs";

export async function folderExists(folderName: string) {
  if (!existsSync(folderName)) {
    await mkdir(folderName);
  }
}

export function deleteFile(fileName: string) {
  const filePath = `upload/${fileName}`;

  unlink(filePath, (err) => {
    if (err) {
      console.error(`Error removing file: ${err}`);
      return;
    }

    console.log(`File ${filePath} has been successfully removed.`);
  });
}
