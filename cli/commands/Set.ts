import { Command } from "commander";
import { ConfigManager } from "../config/ConfigManager.js";
import { promptActivity } from "../prompts/ActivityPrompt.js";
import { success, info } from "../utils/Output.js";
import { handleCLIError } from "../utils/Errors.js";

export function registerSetCommand(program: Command, configManager: ConfigManager): void {
  program
    .command("set")
    .description("Interactively configure Discord Rich Presence activity fields")
    .action(async () => {
      try {
        const currentData = configManager.load();
        info("Opening interactive Rich Presence Activity editor...");
        const updatedActivity = await promptActivity(currentData.activity);
        configManager.updateActivity(updatedActivity);
        success("Rich Presence activity configuration updated successfully.");
        info('Run "richcord start" to apply and broadcast this presence.');
      } catch (err) {
        handleCLIError(err);
      }
    });
}
