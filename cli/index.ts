import { ActivityType, RichcordClient, DiscordUser } from "../src/index.js";

// Replace with your registered Application Client ID from the Discord Developer Portal
const CLIENT_ID = process.env.DISCORD_CLIENT_ID ?? "123456789012345678";

async function main(): Promise<void> {
  const client = new RichcordClient({
    clientId: CLIENT_ID,
    debug: true,
    autoReconnect: true,
    maxReconnectAttempts: 5,
    reconnectIntervalMs: 3000,
  });

  // Event Listeners
  client.on("ready", (user: DiscordUser) => {
    console.log(`Connected to Discord as ${user.username} (${user.id})`);
  });

  client.on("disconnected", (reason: unknown) => {
    console.warn(`Disconnected from Discord RPC: ${reason ?? "Unknown reason"}`);
  });

  client.on("reconnecting", (attempt: number) => {
    console.log(`Attempting reconnection (#${attempt})...`);
  });

  client.on("error", (error: Error) => {
    console.error("Richcord RPC Error:", error);
  });

  try {
    // Connect to local Discord desktop app
    await client.connect();

    // Update Rich Presence Status
    await client.setActivity({
      type: ActivityType.Playing,
      details: "Developing Richcord Core",
      state: "Testing IPC Streams",
      timestamps: {
        start: Date.now(),
      },
      assets: {
        largeImage: "vscode", // Must match uploaded key in Discord Dev Portal
        largeText: "Visual Studio Code",
        smallImage: "typescript",
        smallText: "TypeScript v5.x",
      },
      buttons: [
        {
          label: "View Repository",
          url: "https://github.com",
        },
      ],
    });

    console.log("Rich Presence active. Press Ctrl+C to exit.");
  } catch (error) {
    console.error("Initialization failed:", error);
    process.exit(1);
  }

  // Graceful Shutdown
  const handleExit = async (): Promise<void> => {
    console.log("\nCleaning up Rich Presence and disconnecting...");
    try {
      if (client.isConnected()) {
        await client.clearActivity();
        await client.disconnect();
      }
    } catch (err) {
      console.error("Error during cleanup:", err);
    } finally {
      process.exit(0);
    }
  };

  process.on("SIGINT", handleExit);
  process.on("SIGTERM", handleExit);
}

main().catch(console.error);
