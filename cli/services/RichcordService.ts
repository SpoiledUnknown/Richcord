import * as http from "http";
import * as crypto from "crypto";

import { RichcordClient, ActivityType } from "../../src/index.js";
import type { Activity } from "../../src/index.js";

import { ConfigManager } from "../config/ConfigManager.js";
import type { SerializedActivity, RuntimeState } from "../types/CLIConfig.js";

import { info, success, warn, error as logError } from "../utils/Output.js";

export class RichcordService {
  private configManager: ConfigManager;

  constructor(configManager?: ConfigManager) {
    this.configManager = configManager ?? new ConfigManager();
  }

  public getConfigManager(): ConfigManager {
    return this.configManager;
  }

  public convertSerializedActivity(serialized?: SerializedActivity): Activity | undefined {
    if (!serialized) {
      return undefined;
    }

    const timestamps = serialized.timestamps
      ? {
          ...(serialized.timestamps.start !== undefined && {
            start: serialized.timestamps.start,
          }),
          ...(serialized.timestamps.end !== undefined && {
            end: serialized.timestamps.end,
          }),
        }
      : undefined;

    const assets = serialized.assets
      ? {
          ...(serialized.assets.largeImage && {
            largeImage: serialized.assets.largeImage,
          }),
          ...(serialized.assets.largeText && {
            largeText: serialized.assets.largeText,
          }),
          ...(serialized.assets.smallImage && {
            smallImage: serialized.assets.smallImage,
          }),
          ...(serialized.assets.smallText && {
            smallText: serialized.assets.smallText,
          }),
        }
      : undefined;

    const party = serialized.party
      ? {
          ...(serialized.party.id && {
            id: serialized.party.id,
          }),
          ...(serialized.party.size && {
            size: serialized.party.size,
          }),
        }
      : undefined;

    const secrets = serialized.secrets
      ? {
          ...(serialized.secrets.join && {
            join: serialized.secrets.join,
          }),
          ...(serialized.secrets.spectate && {
            spectate: serialized.secrets.spectate,
          }),
          ...(serialized.secrets.match && {
            match: serialized.secrets.match,
          }),
        }
      : undefined;

    let buttons:
      | readonly [
          { readonly label: string; readonly url: string },
          { readonly label: string; readonly url: string }?,
        ]
      | undefined;

    if (serialized.buttons && serialized.buttons.length > 0) {
      const first = serialized.buttons[0];

      if (!first) {
        throw new Error("Invalid activity configuration: first button is missing.");
      }

      if (serialized.buttons.length === 1) {
        buttons = [
          {
            label: first.label,
            url: first.url,
          },
        ];
      } else {
        const second = serialized.buttons[1];

        if (!second) {
          throw new Error("Invalid activity configuration: second button is missing.");
        }

        buttons = [
          {
            label: first.label,
            url: first.url,
          },
          {
            label: second.label,
            url: second.url,
          },
        ];
      }
    }

    return {
      type: serialized.type ?? ActivityType.Playing,

      ...(serialized.details && {
        details: serialized.details,
      }),

      ...(serialized.state && {
        state: serialized.state,
      }),

      ...(timestamps &&
        Object.keys(timestamps).length > 0 && {
          timestamps,
        }),

      ...(assets &&
        Object.keys(assets).length > 0 && {
          assets,
        }),

      ...(party &&
        Object.keys(party).length > 0 && {
          party,
        }),

      ...(secrets &&
        Object.keys(secrets).length > 0 && {
          secrets,
        }),

      ...(buttons && {
        buttons,
      }),

      ...(serialized.instance !== undefined && {
        instance: serialized.instance,
      }),
    };
  }

  public async runDaemon(): Promise<void> {
    const fullConfig = this.configManager.load();
    const { config, activity: rawActivity } = fullConfig;

    if (!config.clientId) {
      throw new Error('Application Client ID is not configured. Run "richcord config" first.');
    }

    if (!rawActivity) {
      throw new Error('No activity configured. Run "richcord set" first.');
    }

    const activity = this.convertSerializedActivity(rawActivity);

    if (!activity) {
      throw new Error("Invalid activity configuration.");
    }

    const client = new RichcordClient({
      clientId: config.clientId,
      autoReconnect: config.autoReconnect,
      maxReconnectAttempts: config.maxReconnectAttempts,
      reconnectIntervalMs: config.reconnectIntervalMs,
      debug: config.debug,
    });

    // Event handling
    client.on("ready", (user) => {
      success(`Connected to Discord as ${user.username} (${user.id})`);
    });

    client.on("disconnected", (reason) => {
      warn(`Disconnected from Discord RPC: ${reason ?? "Unknown"}`);
    });

    client.on("reconnecting", (attempt) => {
      info(`Attempting reconnection to Discord (#${attempt})...`);
    });

    client.on("error", (err) => {
      logError(`Core Error: ${err.message}`);
    });

    info("Connecting to Discord...");

    await client.connect();
    await client.setActivity(activity);

    success("Rich Presence status updated.");

    // Local HTTP control server for cross-platform stop/status.
    const token = crypto.randomBytes(16).toString("hex");

    const server = http.createServer((req, res) => {
      const authHeader = req.headers["authorization"];

      if (authHeader !== `Bearer ${token}`) {
        res.writeHead(401);
        res.end("Unauthorized");
        return;
      }

      if (req.method === "POST" && req.url === "/stop") {
        res.writeHead(200);
        res.end("Stopping");

        setImmediate(async () => {
          info("Stop request received. Disconnecting from Discord...");

          try {
            if (client.isConnected()) {
              await client.clearActivity();
              await client.disconnect();
            }
          } catch {
            // Ignore errors while shutting down.
          } finally {
            server.close();
            this.configManager.clearRuntime();
            process.exit(0);
          }
        });

        return;
      }

      if (req.method === "GET" && req.url === "/status") {
        res.writeHead(200, {
          "Content-Type": "application/json",
        });

        res.end(
          JSON.stringify({
            connected: client.isConnected(),
            user: client.user,
          })
        );

        return;
      }

      res.writeHead(404);
      res.end("Not Found");
    });

    await new Promise<void>((resolve, reject) => {
      server.once("error", reject);

      server.listen(0, "127.0.0.1", () => {
        const address = server.address();

        if (!address || typeof address === "string") {
          reject(new Error("Failed to determine daemon server port."));
          return;
        }

        const state: RuntimeState = {
          pid: process.pid,
          port: address.port,
          token,
          startedAt: Date.now(),
        };

        this.configManager.saveRuntime(state);
        resolve();
      });
    });

    success(
      `Richcord daemon is running (PID: ${process.pid}). Press Ctrl+C or run "richcord stop" to exit.`
    );

    // Handle process termination signals.
    const shutdown = async () => {
      info("Shutting down Richcord daemon...");

      try {
        if (client.isConnected()) {
          await client.clearActivity();
          await client.disconnect();
        }
      } catch {
        // Ignore errors during shutdown.
      } finally {
        server.close();
        this.configManager.clearRuntime();
        process.exit(0);
      }
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  }

  public async stopDaemon(): Promise<boolean> {
    const runtime = this.configManager.loadRuntime();

    if (!runtime) {
      return false;
    }

    return new Promise((resolve) => {
      const req = http.request(
        {
          hostname: "127.0.0.1",
          port: runtime.port,
          path: "/stop",
          method: "POST",
          headers: {
            Authorization: `Bearer ${runtime.token}`,
          },
          timeout: 3000,
        },
        (res) => {
          if (res.statusCode === 200) {
            this.configManager.clearRuntime();
            resolve(true);
          } else {
            resolve(false);
          }
        }
      );

      req.on("error", () => {
        this.configManager.clearRuntime();
        resolve(false);
      });

      req.on("timeout", () => {
        req.destroy();
        this.configManager.clearRuntime();
        resolve(false);
      });

      req.end();
    });
  }

  public async checkDaemonStatus(): Promise<{
    running: boolean;
    connected?: boolean;
    user?: unknown;
  }> {
    const runtime = this.configManager.loadRuntime();

    if (!runtime) {
      return {
        running: false,
      };
    }

    return new Promise((resolve) => {
      const req = http.get(
        {
          hostname: "127.0.0.1",
          port: runtime.port,
          path: "/status",
          headers: {
            Authorization: `Bearer ${runtime.token}`,
          },
          timeout: 2000,
        },
        (res) => {
          let body = "";

          res.on("data", (chunk) => {
            body += chunk;
          });

          res.on("end", () => {
            try {
              const data = JSON.parse(body) as {
                connected?: boolean;
                user?: unknown;
              };

              resolve({
                running: true,
                ...(data.connected !== undefined && {
                  connected: data.connected,
                }),
                ...(data.user !== undefined && {
                  user: data.user,
                }),
              });
            } catch {
              resolve({
                running: false,
              });
            }
          });
        }
      );

      req.on("error", () => {
        this.configManager.clearRuntime();

        resolve({
          running: false,
        });
      });

      req.on("timeout", () => {
        req.destroy();

        resolve({
          running: false,
        });
      });
    });
  }

  public async clearActivePresence(): Promise<void> {
    const fullConfig = this.configManager.load();

    if (!fullConfig.config.clientId) {
      throw new Error("Application Client ID is not configured.");
    }

    const client = new RichcordClient({
      clientId: fullConfig.config.clientId,
    });

    try {
      await client.connect();
      await client.clearActivity();
    } finally {
      if (client.isConnected()) {
        await client.disconnect();
      }
    }
  }
}
