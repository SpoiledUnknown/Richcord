// Core Library API
export { RichcordClient } from "./core/RichcordClient.js";

export type { RichcordClientOptions, ResolvedRichcordConfig } from "./core/Config.js";

export { ClientState } from "./core/State.js";

export { RPCCommands, RPCConstraints, Defaults } from "./utils/Constants.js";

export { UpdateService } from "./core/UpdateService.js";

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
export type {
  Activity,
  ActivityTimestamps,
  ActivityAssets,
  ActivityParty,
  ActivitySecrets,
  ActivityButton,
} from "./types/index.js";

export { ActivityType } from "./types/index.js";

// Transport Interfaces and Logger (for Custom Injection)
export type { ITransport } from "./rpc/transport/ITransport.js";

export type { ILogger } from "./utils/Logger.js";

export { DefaultLogger } from "./utils/Logger.js";
