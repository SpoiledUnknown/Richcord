import {
  RichcordClient,
  ClientState,
  RichcordError,
  IPCConnectionError,
  ClientNotConnectedError,
  HandshakeError,
  SerializationError,
  ValidationError,
  ActivityType,
  RPCCommands,
  RPCConstraints,
  Defaults,
  DefaultLogger,
  UpdateService,
} from "richcord";
import type {
  RichcordClientOptions,
  ResolvedRichcordConfig,
  Activity,
  ActivityTimestamps,
  ActivityAssets,
  ActivityParty,
  ActivitySecrets,
  ActivityButton,
  ITransport,
  ILogger,
} from "richcord";

// Verify type declarations can be referenced and assigned without connecting to Discord
let client: RichcordClient | undefined;
let state: ClientState = ClientState.Disconnected;
let actType: ActivityType = ActivityType.Playing;
let err: RichcordError = new ValidationError("test error");

let config: RichcordClientOptions = {
  clientId: "123456789012345678",
  autoReconnect: false,
  maxReconnectAttempts: 3,
  reconnectIntervalMs: 5000,
};

let timestamps: ActivityTimestamps = {
  start: 1700000000,
  end: 1700005000,
};

let assets: ActivityAssets = {
  largeImage: "logo",
  largeText: "Richcord Logo",
  smallImage: "badge",
  smallText: "Active",
};

let party: ActivityParty = {
  id: "party-1",
  size: [1, 5],
};

let secrets: ActivitySecrets = {
  join: "join-secret",
  match: "match-secret",
};

let button: ActivityButton = {
  label: "GitHub",
  url: "https://github.com",
};

let activity: Activity = {
  type: actType,
  details: "Testing type declarations",
  state: "In development",
  timestamps,
  assets,
  party,
  secrets,
  buttons: [button],
};

// Verify types are usable as type constraints
function assertClientState(s: ClientState): boolean {
  return s === ClientState.Ready;
}

// Suppress unused variable warnings
void client;
void state;
void actType;
void err;
void config;
void activity;
void assertClientState;
