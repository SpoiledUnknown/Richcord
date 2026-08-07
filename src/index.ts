// Core Library API
export { RichcordClient } from "./core/RichcordClient.js";
export { RichcordClientOptions, ResolvedRichcordConfig } from "./core/Config.js";
export { ClientState } from "./core/State.js";
export { RPCCommands, RPCConstraints, Defaults } from "./utils/Constants.js";

// Custom Typed Errors
export {
  RichcordError,
  IPCConnectionError,
  ClientNotConnectedError,
  HandshakeError,
  SerializationError,
  ValidationError,
} from "./errors/index.js";

// Data Types and Interfaces
export {
  Activity,
  ActivityType,
  ActivityTimestamps,
  ActivityAssets,
  ActivityParty,
  ActivitySecrets,
  ActivityButton,
  DiscordUser,
  ClientEvents,
} from "./types/index.js";

// Transport Interfaces and Logger (for Custom Injection)
export { ITransport } from "./rpc/transport/ITransport.js";
export { ILogger, DefaultLogger } from "./utils/Logger.js";
