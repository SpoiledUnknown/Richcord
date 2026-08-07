import { HandshakeError } from "../errors/HandshakeError.js";
import { HandshakePayload } from "../types/protocols.js";
import { Opcode } from "./Opcodes.js";
import { Serializer } from "./Serializer.js";

/**
 * Discord IPC protocol version.
 */
export const RPC_VERSION = 1;

/**
 * Creates Discord IPC handshake frames.
 */
export class Handshake {
  /**
   * Creates the initial Discord IPC handshake frame.
   */
  public static createFrame(clientId: string): Buffer {
    const trimmedClientId = clientId.trim();

    if (trimmedClientId.length === 0) {
      throw new HandshakeError("Client ID must be a non-empty string.");
    }

    const payload: HandshakePayload = {
      v: RPC_VERSION,
      client_id: trimmedClientId,
    };

    try {
      return Serializer.encode(Opcode.HANDSHAKE, payload);
    } catch (err) {
      throw new HandshakeError("Failed to serialize IPC handshake frame.", err);
    }
  }
}
