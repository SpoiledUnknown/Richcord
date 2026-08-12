import type { ActivityType } from "../../src/index.js";

export interface SerializedTimestamps {
  start?: number;
  end?: number;
}

export interface SerializedButton {
  label: string;
  url: string;
}

export interface SerializedAssets {
  largeImage?: string;
  largeText?: string;
  smallImage?: string;
  smallText?: string;
}

export interface SerializedParty {
  id?: string;
  size?: [number, number];
}

export interface SerializedSecrets {
  join?: string;
  spectate?: string;
  match?: string;
}

export interface SerializedActivity {
  type?: ActivityType;
  details?: string;
  state?: string;
  timestamps?: SerializedTimestamps;
  assets?: SerializedAssets;
  party?: SerializedParty;
  secrets?: SerializedSecrets;
  buttons?: SerializedButton[];
  instance?: boolean;
}

export interface AppConfig {
  clientId: string;
  autoReconnect: boolean;
  maxReconnectAttempts: number;
  reconnectIntervalMs: number;
  debug: boolean;
}

export interface CLIConfigData {
  version: number;
  config: AppConfig;
  activity?: SerializedActivity;
}

export interface RuntimeState {
  pid: number;
  port: number;
  token: string;
  startedAt: number;
}
