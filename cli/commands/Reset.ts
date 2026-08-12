import { Command } from "commander";
import { confirm } from "@inquirer/prompts";
import { ConfigManager } from "../config/ConfigManager.js";
import { success, info } from "../utils/Output.js";
import { handleCLIError } from "../utils/Errors.js";

export function registerResetCommand(program: Command, configManager: ConfigManager): void {
  program
    .command("reset")
    .description("Reset and delete saved Richcord CLI configuration")
    .action(async () => {
      try {
        if (!configManager.exists()) {
          info("No saved configuration file exists.");
          return;
        }

        const sure = await confirm({
          message: "Are you sure you want to delete all saved Richcord configuration?",
          default: false,
        });

        if (sure) {
          configManager.reset();
          success("Richcord configuration deleted.");
        } else {
          info("Reset cancelled.");
        }
      } catch (err) {
        handleCLIError(err);
      }
    });
}
