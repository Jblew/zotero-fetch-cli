import Axios from "axios";
import parseLinkHeader from "parse-link-header";
import * as fs from "fs";

const ZOTERO_APIKEY: string = process.env.ZOTERO_APIKEY as string;
if (!ZOTERO_APIKEY) throw new Error("Missing env ZOTERO_APIKEY");
const ZOTERO_USERID: string = process.env.ZOTERO_USERID as string;
if (!ZOTERO_USERID) throw new Error("Missing env ZOTERO_USERID");

export async function getArrayFromZotero(apiUrl: string) {
  const { pages } = await getFromZoteroAllPages(apiUrl);
  return pages.flat();
}

export async function getStringFromZotero(apiUrl: string) {
  const { pages } = await getFromZoteroAllPages(apiUrl);
  return pages.join("");
}

export async function getFromZoteroAllPages<T>(apiUrl: string): Promise<{
  pages: T[];
  headers: Array<Record<string, string>>;
}> {
  let url: string | undefined = getZoteroFullUrl(apiUrl);
  const pages: T[] = [];
  const headers: Array<Record<string, string>> = [];

  while (url) {
    const resp = await getFromZoteroRaw(url);
    pages.push(resp.data);
    headers.push(resp.headers);

    const nextUrl = getNextUrlFromZoteroResponseHeaders(resp.headers);
    url = nextUrl || undefined;
  }
  return { pages, headers };
}

export async function writeToFile(path: string, data: any) {
  return fs.writeFileSync(path, data.toString());
}

export async function deleteFile(path: string) {
  return fs.unlinkSync(path);
}

export async function ensureDirectoryExists(path: string) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
  if (!fs.lstatSync(path).isDirectory()) {
    throw new Error(`${path} is not a directory`);
  }
}

export async function downloadZoteroAttachment(
  itemKey: string,
  outputLocationPath: string
) {
  const key = ZOTERO_APIKEY;
  const userid = ZOTERO_USERID;
  const fileUrl = `https://api.zotero.org/users/${userid}/items/${itemKey}/file`;
  const writer = fs.createWriteStream(outputLocationPath);

  return Axios({
    method: "get",
    url: fileUrl,
    headers: {
      "Zotero-API-Version": "3",
      "Zotero-API-Key": key,
    },
    responseType: "stream",
  }).then((response) => {
    //ensure that the user can call `then()` only when the file has
    //been downloaded entirely.

    return new Promise((resolve, reject) => {
      response.data.pipe(writer);
      let error: any = null;
      writer.on("error", (err) => {
        error = err;
        writer.close();
        reject(err);
      });
      writer.on("close", () => {
        if (!error) {
          resolve(true);
        }
        //no need to call the reject here, as it will have been called in the
        //'error' stream;
      });
    });
  });
}

function getZoteroFullUrl(apiUrl: string) {
  const userid = ZOTERO_USERID;
  return `https://api.zotero.org/users/${userid}/${apiUrl}`;
}

async function getFromZoteroRaw(url: string) {
  const key = ZOTERO_APIKEY;
  const resp = await Axios({
    method: "get",
    url,
    headers: {
      "Zotero-API-Version": "3",
      "Zotero-API-Key": key,
    },
  });
  if (resp.status !== 200) {
    throw new Error(`Response status is ${resp.status}`);
  }
  return resp;
}

function getNextUrlFromZoteroResponseHeaders(headers: Record<string, any>) {
  const linkHeader = headers["link"] || headers["Link"];
  if (!linkHeader) return;
  const parsed = parseLinkHeader(linkHeader);
  if (parsed && parsed.next) {
    return parsed.next.url;
  }
}
