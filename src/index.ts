#!/usr/bin/env node

import { Command } from "commander";
import { fetchModifiedAttachments } from "./fetch-attachments";
import { fetchBibliographyToFile } from "./fetch-bibliography";
const program = new Command();

program
  .command("bibliography <destination>")
  .requiredOption("--format <json|bibtex>", "json|bibtex")
  .description("Fetches entire user bibliography to json or bibtex")
  .action(async (destination, options) => {
    try {
      await fetchBibliographyToFile({ destination, format: options.format });
      console.log(`Written to ${destination}`);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  });

program
  .command("attachments <dir>")
  .description("Fetches modified attachments to the given directory")
  .action(async (dir) => {
    try {
      await fetchModifiedAttachments({ dir });
      console.log(`Attachments synchronized with ${dir}`);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  });

program.parse(process.argv);
