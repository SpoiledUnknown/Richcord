import { Command } from "commander";
import { RichcordService } from "../services/RichcordService.js";
import { handleCLIError } from "../utils/Errors.js";

export function registerStartCommand(program: Command, service: RichcordService): void {
  program
    .command("start")
    .description("Start the continuous Richcord presence daemon process")
    .action(async () => {
      try {
        await service.runDaemon();
      } catch (err) {
        handleCLIError(err);
      }
    });
}
