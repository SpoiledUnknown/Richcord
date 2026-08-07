export const RPCCommands = {
  SET_ACTIVITY: "SET_ACTIVITY",
} as const;

export type RPCCommand = (typeof RPCCommands)[keyof typeof RPCCommands];

export const RPCEvents = {
  READY: "READY",
  ERROR: "ERROR",
} as const;

export type RPCEvent = (typeof RPCEvents)[keyof typeof RPCEvents];

export const Defaults = {
  COMMAND_TIMEOUT_MS: 10000,
  CONNECT_TIMEOUT_MS: 5000,
  MAX_RECONNECT_ATTEMPTS: 5,
  RECONNECT_INTERVAL_MS: 3000,
} as const;

export const RPCConstraints = {
  MAX_DETAILS_LENGTH: 128,
  MAX_STATE_LENGTH: 128,
  MAX_ASSET_KEY_LENGTH: 256,
  MAX_ASSET_TEXT_LENGTH: 128,
  MAX_PARTY_ID_LENGTH: 128,
  MAX_SECRET_LENGTH: 128,
  MAX_BUTTONS_COUNT: 2,
  MAX_BUTTON_LABEL_LENGTH: 32,
  MAX_BUTTON_URL_LENGTH: 512,
} as const;
