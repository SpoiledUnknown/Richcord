const assert = require("node:assert");
const Richcord = require("richcord");
const {
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
} = require("richcord");

// Verify exports exist and have expected types
assert.strictEqual(typeof RichcordClient, "function", "RichcordClient should be a class/function");
assert.strictEqual(typeof UpdateService, "function", "UpdateService should be a class/function");
assert.strictEqual(typeof DefaultLogger, "function", "DefaultLogger should be a class/function");

// Verify Enums and Objects
assert.strictEqual(
  ClientState.Disconnected,
  "Disconnected",
  "ClientState enum should have Disconnected"
);
assert.strictEqual(ClientState.Ready, "Ready", "ClientState enum should have Ready");
assert.strictEqual(ActivityType.Playing, 0, "ActivityType.Playing should be 0");
assert.strictEqual(
  typeof RPCCommands.SET_ACTIVITY,
  "string",
  "RPCCommands should have SET_ACTIVITY"
);
assert.strictEqual(
  typeof RPCConstraints.MAX_BUTTONS_COUNT,
  "number",
  "RPCConstraints should have MAX_BUTTONS_COUNT"
);
assert.strictEqual(
  typeof Defaults.COMMAND_TIMEOUT_MS,
  "number",
  "Defaults should have COMMAND_TIMEOUT_MS"
);

// Verify Custom Errors
assert(new RichcordError("err") instanceof Error, "RichcordError should inherit Error");
assert(
  new ValidationError("err") instanceof RichcordError,
  "ValidationError should inherit RichcordError"
);
assert(
  new IPCConnectionError("err") instanceof RichcordError,
  "IPCConnectionError should inherit RichcordError"
);
assert(
  new ClientNotConnectedError("err") instanceof RichcordError,
  "ClientNotConnectedError should inherit RichcordError"
);
assert(
  new HandshakeError("err") instanceof RichcordError,
  "HandshakeError should inherit RichcordError"
);
assert(
  new SerializationError("err") instanceof RichcordError,
  "SerializationError should inherit RichcordError"
);

// Verify namespace contains all named exports
assert.strictEqual(Richcord.RichcordClient, RichcordClient);
assert.strictEqual(Richcord.ClientState, ClientState);
assert.strictEqual(Richcord.ActivityType, ActivityType);
assert.strictEqual(Richcord.RPCCommands, RPCCommands);
assert.strictEqual(Richcord.RPCConstraints, RPCConstraints);
assert.strictEqual(Richcord.Defaults, Defaults);
assert.strictEqual(Richcord.DefaultLogger, DefaultLogger);
assert.strictEqual(Richcord.UpdateService, UpdateService);
assert.strictEqual(Richcord.RichcordError, RichcordError);
assert.strictEqual(Richcord.ValidationError, ValidationError);
assert.strictEqual(Richcord.IPCConnectionError, IPCConnectionError);
assert.strictEqual(Richcord.ClientNotConnectedError, ClientNotConnectedError);
assert.strictEqual(Richcord.HandshakeError, HandshakeError);
assert.strictEqual(Richcord.SerializationError, SerializationError);
