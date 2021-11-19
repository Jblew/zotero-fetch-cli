import { getArrayFromZotero, getStringFromZotero, writeToFile } from "./utils";

export type Format = "json" | "bibtex";

export async function fetchBibliographyToFile({
  destination,
  format,
}: {
  destination: string;
  format: Format;
}) {
  if (format === "json") {
    const items = await getArrayFromZotero("items?format=json&limit=50");
    await writeToFile(destination, JSON.stringify(items, undefined, 2));
  } else if (format === "bibtex") {
    const bibtex = await getStringFromZotero("items?format=bibtex&limit=50");
    await writeToFile(destination, bibtex);
  } else {
    throw new Error(`Unknown format ${format}`);
  }
}
