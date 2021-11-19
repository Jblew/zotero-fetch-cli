#!/usr/bin/env node

import { Command } from "commander";
import { fetchBibliographyToFile } from "./fetch-bibliography";
const program = new Command();

program
  .command("fetch-bibliography <destination>")
  .requiredOption("--format <json|bibtex>", "json|bibtex")
  .description("Fetches entire user bibliography to json or bibtex")
  .action(async (destination, options) => {
    console.log({
      destination,
      options,
    });
    try {
      await fetchBibliographyToFile({ destination, format: options.format });
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  });

program.parse(process.argv);
