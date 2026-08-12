import type { CLIConfigData, AppConfig, SerializedActivity } from "../types/CLIConfig.js";
import { CONFIG_VERSION, DEFAULT_CLIENT_ID } from "../utils/Constants.js";

export const DEFAULT_APP_CONFIG: AppConfig = {
  clientId: DEFAULT_CLIENT_ID,
  autoReconnect: true,
  maxReconnectAttempts: 10,
  reconnectIntervalMs: 5000,
  debug: false,
};

export const DEFAULT_CLI_CONFIG: CLIConfigData = {
  version: CONFIG_VERSION,
  config: DEFAULT_APP_CONFIG,
};

export function validateAndMigrateConfig(data: unknown): CLIConfigData {
  if (!data || typeof data !== "object") {
    throw new Error("Configuration file must contain a valid JSON object.");
  }

  const obj = data as Record<string, unknown>;

  const version = typeof obj.version === "number" ? obj.version : CONFIG_VERSION;

  const rawConfig =
    obj.config && typeof obj.config === "object" ? (obj.config as Record<string, unknown>) : {};

  const config: AppConfig = {
    clientId:
      typeof rawConfig.clientId === "string" ? rawConfig.clientId : DEFAULT_APP_CONFIG.clientId,

    autoReconnect:
      typeof rawConfig.autoReconnect === "boolean"
        ? rawConfig.autoReconnect
        : DEFAULT_APP_CONFIG.autoReconnect,

    maxReconnectAttempts:
      typeof rawConfig.maxReconnectAttempts === "number"
        ? rawConfig.maxReconnectAttempts
        : DEFAULT_APP_CONFIG.maxReconnectAttempts,

    reconnectIntervalMs:
      typeof rawConfig.reconnectIntervalMs === "number"
        ? rawConfig.reconnectIntervalMs
        : DEFAULT_APP_CONFIG.reconnectIntervalMs,

    debug: typeof rawConfig.debug === "boolean" ? rawConfig.debug : DEFAULT_APP_CONFIG.debug,
  };

  const result: CLIConfigData = {
    version,
    config,
  };

  if (obj.activity && typeof obj.activity === "object") {
    result.activity = obj.activity as SerializedActivity;
  }

  return result;
}
