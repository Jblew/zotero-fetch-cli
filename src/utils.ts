import Axios from "axios";
import parseLinkHeader from "parse-link-header";
import * as fs from "fs";

const ZOTERO_APIKEY: string = process.env.ZOTERO_APIKEY as string;
if (!ZOTERO_APIKEY) throw new Error("Missing env ZOTERO_APIKEY");
const ZOTERO_USERID: string = process.env.ZOTERO_USERID as string;
if (!ZOTERO_USERID) throw new Error("Missing env ZOTERO_USERID");

export async function getArrayFromZotero(apiUrl: string) {
  const userid = ZOTERO_USERID;
  let url:
    | string
    | undefined = `https://api.zotero.org/users/${userid}/${apiUrl}`;
  let out = [];

  while (url) {
    const resp = await getFromZoteroRaw(url);
    out.push(...resp.data);

    const nextUrl = getNextUrlFromZoteroResponseHeaders(resp.headers);
    if (nextUrl) url = nextUrl;
    else url = undefined;
  }
  return out;
}

export async function getStringFromZotero(apiUrl: string) {
  const userid = ZOTERO_USERID;
  let url:
    | string
    | undefined = `https://api.zotero.org/users/${userid}/${apiUrl}`;
  let out = "";

  while (url) {
    const resp = await getFromZoteroRaw(url);
    out += resp.data;

    const nextUrl = getNextUrlFromZoteroResponseHeaders(resp.headers);
    if (nextUrl) url = nextUrl;
    else url = undefined;
  }
  return out;
}

export async function writeToFile(path: string, data: any) {
  return fs.writeFileSync(path, data.toString());
}

export async function ensureDirectoryExists(path: string) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
  if (!fs.lstatSync(path).isDirectory()) {
    throw new Error(`${path} is not a directory`);
  }
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
