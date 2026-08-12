import { input, confirm, number } from "@inquirer/prompts";
import { AppConfig } from "../types/CLIConfig.js";

export async function promptConfig(current: AppConfig): Promise<AppConfig> {
  const clientId = await input({
    message: "Discord Application Client ID:",
    default: current.clientId,
    validate: (val) => {
      if (!val || val.trim().length === 0) {
        return "Client ID cannot be empty.";
      }
      if (!/^\d+$/.test(val.trim())) {
        return "Client ID must be a numeric string.";
      }
      return true;
    },
  });

  const autoReconnect = await confirm({
    message: "Enable automatic reconnection on disconnect?",
    default: current.autoReconnect,
  });

  let maxReconnectAttempts = current.maxReconnectAttempts;
  let reconnectIntervalMs = current.reconnectIntervalMs;

  if (autoReconnect) {
    const attempts = await number({
      message: "Maximum reconnect attempts:",
      default: current.maxReconnectAttempts,
      min: 1,
      max: 100,
    });
    maxReconnectAttempts = attempts ?? current.maxReconnectAttempts;

    const interval = await number({
      message: "Reconnect interval (milliseconds):",
      default: current.reconnectIntervalMs,
      min: 1000,
      max: 60000,
    });
    reconnectIntervalMs = interval ?? current.reconnectIntervalMs;
  }

  const debug = await confirm({
    message: "Enable debug logging mode?",
    default: current.debug,
  });

  return {
    clientId: clientId.trim(),
    autoReconnect,
    maxReconnectAttempts,
    reconnectIntervalMs,
    debug,
  };
}
