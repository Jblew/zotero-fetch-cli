#!/usr/bin/env node

import { Command } from "commander";
const program = new Command();

program
  .command("fetch-bibliography <destination>")
  .requiredOption("--format <json|bibtex>", "json|bibtex")
  .description("Fetches entire user bibliography to json or bibtex")
  .action((destination, options) => {
    console.log({
      destination,
      options,
    });
  });

program.parse(process.argv);
