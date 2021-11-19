import * as path from "path";
import * as fs from "fs";
import {
  deleteFile,
  downloadZoteroAttachment,
  ensureDirectoryExists,
  getFromZoteroAllPages,
} from "./utils";

type ZoteroItem = {
  key: string;
  links: { attachment?: { href?: string } };
} & Record<string, any>;

export async function fetchModifiedAttachments({ dir }: { dir: string }) {
  ensureDirectoryExists(dir);
  const versionFilePath = getVersionFilePath(dir);
  const currentVersion = getVersion(versionFilePath);

  const { modifiedItems, newVersion } = await getModifiedSince(
    currentVersion,
    "items"
  );
  for (const item of modifiedItems) {
    await downloadItem(item, getItemPath(item, dir));
  }

  await writeVersion(versionFilePath, newVersion);
}

async function getModifiedSince(
  version: number | undefined,
  kind: "items"
): Promise<{ modifiedItems: ZoteroItem[]; newVersion: number }> {
  const url =
    `${kind}?format=json&limit=100` + (version ? `&since=${version}` : "");
  const { pages, headers } = await getFromZoteroAllPages<ZoteroItem>(url);
  const modifiedItems = pages.flat();
  const headersOfLastRequest = headers[headers.length - 1];
  const newVersion = parseInt(
    headersOfLastRequest["last-modified-version"],
    10
  );
  return { modifiedItems, newVersion };
}

function getVersionFilePath(dir: string) {
  return path.join(dir, ".version");
}

function getVersion(versionFilePath: string): number | undefined {
  if (!fs.existsSync(versionFilePath)) return undefined;
  return parseInt(fs.readFileSync(versionFilePath).toString().trim(), 10);
}

function writeVersion(versionFilePath: string, version: number) {
  return fs.writeFileSync(versionFilePath, version.toString());
}

function getItemPath(item: ZoteroItem, dir: string): string {
  const filename = `${item.key}.pdf`;
  return path.resolve(dir, filename);
}

async function downloadItem(item: ZoteroItem, path: string) {
  if (item.links.attachment?.href) {
    return downloadZoteroAttachment(`${item.links.attachment.href}/file`, path);
  }
}
