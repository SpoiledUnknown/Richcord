import { Command } from "commander";
import { UpdateService } from "../../src/index.js";
import { success, info } from "../utils/Output.js";
import { handleCLIError } from "../utils/Errors.js";

export function registerUpdateCommand(program: Command, currentVersion: string): void {
  program
    .command("update")
    .description("Check for available updates for Richcord")
    .action(async () => {
      try {
        info(`Current version: v${currentVersion}`);
        info("Checking GitHub for updates...");

        const service = new UpdateService();

        const result = await service.checkUpdate();

        if (result.hasUpdate) {
          success(`A new version of Richcord is available: v${result.latestVersion}`);

          if (result.releaseUrl) {
            info(`Release: ${result.releaseUrl}`);
          }
        } else {
          success("Richcord is up to date.");
        }
      } catch (err) {
        handleCLIError(err);
      }
    });
}
