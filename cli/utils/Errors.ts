import {
  RichcordError,
  IPCConnectionError,
  ClientNotConnectedError,
  HandshakeError,
  SerializationError,
  ValidationError,
} from "../../src/index.js";
import { error as logError } from "./Output.js";

export function handleCLIError(err: unknown): never {
  if (err instanceof ValidationError) {
    logError(`Validation Error: ${err.message}`);
  } else if (err instanceof IPCConnectionError) {
    logError(`IPC Connection Error: Could not connect to Discord desktop client. (${err.message})`);
    logError("Please ensure the Discord desktop app is open and running.");
  } else if (err instanceof ClientNotConnectedError) {
    logError(`Client Not Connected: ${err.message}`);
  } else if (err instanceof HandshakeError) {
    logError(`Discord Handshake Failed: ${err.message}`);
  } else if (err instanceof SerializationError) {
    logError(`Data Serialization Error: ${err.message}`);
  } else if (err instanceof RichcordError) {
    logError(`Richcord Core Error: ${err.message}`);
  } else if (err instanceof Error) {
    logError(err.message);
  } else {
    logError("An unknown error occurred.");
  }

  process.exit(1);
}
