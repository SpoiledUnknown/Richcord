import { Command } from "commander";
import { RichcordService } from "../services/RichcordService.js";
import { maskString } from "../utils/Output.js";
import { ActivityType } from "../../src/index.js";
import { handleCLIError } from "../utils/Errors.js";

export function registerStatusCommand(program: Command, service: RichcordService): void {
  program
    .command("status")
    .description("Display current Richcord configuration, connection, and activity state")
    .action(async () => {
      try {
        const configManager = service.getConfigManager();
        const exists = configManager.exists();
        console.log("\n--- Richcord Status ---");
        console.log(`Config File Exists: ${exists ? "Yes" : "No"}`);
        console.log(`Config Directory:   ${configManager.getConfigDir()}`);

        if (exists) {
          const data = configManager.load();
          const maskedId = data.config.clientId
            ? maskString(data.config.clientId)
            : "(not configured)";
          console.log(`Client ID:          ${maskedId}`);
          console.log(`Auto Reconnect:     ${data.config.autoReconnect}`);

          if (data.activity) {
            const typeName = ActivityType[data.activity.type ?? ActivityType.Playing] || "Playing";
            console.log("\n--- Configured Activity ---");
            console.log(`Type:     ${typeName}`);
            if (data.activity.details) console.log(`Details:  ${data.activity.details}`);
            if (data.activity.state) console.log(`State:    ${data.activity.state}`);
            if (data.activity.assets?.largeImage)
              console.log(`Large Img: ${data.activity.assets.largeImage}`);
          } else {
            console.log("\nActivity:           (none configured)");
          }
        }

        const daemonState = await service.checkDaemonStatus();
        console.log("\n--- Daemon Runtime ---");
        console.log(`Daemon Running:     ${daemonState.running ? "Yes" : "No"}`);
        if (daemonState.running) {
          console.log(`Connected to Discord: ${daemonState.connected ? "Yes" : "No"}`);
        }
        console.log("");
      } catch (err) {
        handleCLIError(err);
      }
    });
}
