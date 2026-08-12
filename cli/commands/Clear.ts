import { Command } from "commander";
import { RichcordService } from "../services/RichcordService.js";
import { success } from "../utils/Output.js";
import { handleCLIError } from "../utils/Errors.js";

export function registerClearCommand(program: Command, service: RichcordService): void {
  program
    .command("clear")
    .description("Clear the active Rich Presence from Discord desktop client")
    .action(async () => {
      try {
        await service.clearActivePresence();
        success("Discord Rich Presence cleared.");
      } catch (err) {
        handleCLIError(err);
      }
    });
}
