const { getItemsFromZotero, writeToFile } = require("./utils");

const BIBTEX_PATH = process.env.BIBTEX_PATH;
if (!BIBTEX_PATH) throw new Error("Missing env BIBTEX_PATH");
const ZOTEROJSON_PATH = process.env.ZOTEROJSON_PATH;
if (!ZOTEROJSON_PATH) throw new Error("Missing env ZOTEROJSON_PATH");

(async (startFn) => {
  try {
    await startFn();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})(fetchFromZotero);

async function fetchFromZotero() {
  const items = await getItemsFromZotero("items?format=json&limit=50", {
    type: "array",
  });
  console.log(items);
  await writeToFile(ZOTEROJSON_PATH, JSON.stringify(items, undefined, 2));

  const bibtex = await getItemsFromZotero("items?format=bibtex&limit=50", {
    type: "string",
  });
  console.log(bibtex);
  await writeToFile(BIBTEX_PATH, bibtex);
  console.log("Done");
}
