import { Command } from "commander";
import { RichcordService } from "../services/RichcordService.js";
import { success, warn } from "../utils/Output.js";
import { handleCLIError } from "../utils/Errors.js";

export function registerStopCommand(program: Command, service: RichcordService): void {
  program
    .command("stop")
    .description("Gracefully stop the running Richcord background daemon")
    .action(async () => {
      try {
        const stopped = await service.stopDaemon();
        if (stopped) {
          success("Richcord daemon stopped successfully.");
        } else {
          warn("No running Richcord daemon instance was found.");
        }
      } catch (err) {
        handleCLIError(err);
      }
    });
}
