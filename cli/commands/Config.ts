import { Command } from "commander";
import { ConfigManager } from "../config/ConfigManager.js";
import { promptConfig } from "../prompts/ConfigPrompt.js";
import { success, info } from "../utils/Output.js";
import { handleCLIError } from "../utils/Errors.js";

export function registerConfigCommand(program: Command, configManager: ConfigManager): void {
  program
    .command("config")
    .description("Configure Richcord application settings (Client ID, reconnect parameters)")
    .action(async () => {
      try {
        const currentData = configManager.load();
        info("Configuring Richcord application settings...");
        const updatedConfig = await promptConfig(currentData.config);
        configManager.updateAppConfig(updatedConfig);
        success(`Configuration saved to "${configManager.getConfigPath()}".`);
      } catch (err) {
        handleCLIError(err);
      }
    });
}
