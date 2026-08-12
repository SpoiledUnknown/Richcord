#!/usr/bin/env node

import { Command } from "commander";
import { ConfigManager } from "./config/ConfigManager.js";
import { RichcordService } from "./services/RichcordService.js";
import { registerConfigCommand } from "./commands/Config.js";
import { registerSetCommand } from "./commands/Set.js";
import { registerStartCommand } from "./commands/Start.js";
import { registerStopCommand } from "./commands/Stop.js";
import { registerClearCommand } from "./commands/Clear.js";
import { registerResetCommand } from "./commands/Reset.js";
import { registerStatusCommand } from "./commands/Status.js";
import { registerUpdateCommand } from "./commands/Update.js";
import { UpdateServices } from "../src/utils/Constants.js";

async function main(): Promise<void> {
  const version = UpdateServices.VERSION;
  const configManager = new ConfigManager();
  const richcordService = new RichcordService(configManager);

  const program = new Command();

  program
    .name("richcord")
    .description("Richcord CLI — Discord Rich Presence Manager")
    .version(version, "-v, --version", "Output the installed Richcord version")
    .helpOption("-h, --help", "Display command help");

  // Subcommands
  registerConfigCommand(program, configManager);
  registerSetCommand(program, configManager);
  registerStartCommand(program, richcordService);
  registerStopCommand(program, richcordService);
  registerClearCommand(program, richcordService);
  registerResetCommand(program, configManager);
  registerStatusCommand(program, richcordService);
  registerUpdateCommand(program, version);

  // Root command default help action if no arguments provided
  if (process.argv.length <= 2) {
    program.outputHelp();
    process.exit(0);
  }

  await program.parseAsync(process.argv);
}

main().catch((err) => {
  console.error("Fatal CLI Error:", err);
  process.exit(1);
});
