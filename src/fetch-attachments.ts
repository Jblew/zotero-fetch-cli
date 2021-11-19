import * as path from "path";
import * as fs from "fs";
import { ensureDirectoryExists } from "./utils";

export async function fetchModifiedAttachments({ dir }: { dir: string }) {
  ensureDirectoryExists(dir);
  const versionFilePath = getVersionFilePath(dir);
  const currentVersion = getVersion(versionFilePath);

  const { modifiedItems, newVersion } = await getModifiedSince(currentVersion);
  const deletedItems = await getDeletedSince(currentVersion);
  for (const item of modifiedItems) {
    await downloadItem(item, dir);
  }
  for (const item of deletedItems) {
    await deleteItem(item, dir);
  }

  await writeVersion(versionFilePath, newVersion);
}

function getVersionFilePath(dir: string) {
  return path.join(dir, ".version");
}

function getVersion(versionFilePath: string) {
  return fs.readFileSync(versionFilePath);
}

function writeVersion(versionFilePath: string, version: string) {
  return fs.writeFileSync(versionFilePath, version.toString());
}
