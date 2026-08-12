import { SerializationError } from "../errors/SerializationError.js";
import { IPCPacket } from "../types/Protocols.js";
import { Opcode } from "./Opcodes.js";

/**
 * Result of decoding a single IPC frame.
 */
export interface DecodeResult {
  readonly packet: IPCPacket;
  readonly bytesRead: number;
}

/**
 * Encodes and decodes Discord IPC frames.
 *
 * Frame layout:
 * [0..3]  Opcode (uint32 LE)
 * [4..7]  Payload Length (uint32 LE)
 * [8..N]  UTF-8 JSON Payload
 */
export class Serializer {
  public static readonly HEADER_SIZE = 8;
  private static readonly MAX_FRAME_SIZE = 16 * 1024 * 1024; // 16 MiB

  /**
   * Encodes a payload into a Discord IPC frame.
   */
  public static encode(opcode: Opcode, payload: unknown): Buffer {
    let json: string;

    try {
      json = JSON.stringify(payload);
    } catch (err) {
      throw new SerializationError("Failed to stringify packet payload to JSON.", err);
    }

    const payloadBuffer = Buffer.from(json, "utf-8");
    const frame = Buffer.allocUnsafe(Serializer.HEADER_SIZE + payloadBuffer.length);

    frame.writeUInt32LE(opcode, 0);
    frame.writeUInt32LE(payloadBuffer.length, 4);
    payloadBuffer.copy(frame, Serializer.HEADER_SIZE);

    return frame;
  }

  /**
   * Attempts to decode a complete IPC frame.
   *
   * Returns `null` when additional bytes are required.
   */
  public static decode(buffer: Buffer): DecodeResult | null {
    if (buffer.length < Serializer.HEADER_SIZE) {
      return null;
    }

    const opcode = buffer.readUInt32LE(0) as Opcode;
    const payloadLength = buffer.readUInt32LE(4);

    if (payloadLength > Serializer.MAX_FRAME_SIZE) {
      throw new SerializationError("Incoming IPC frame exceeds the maximum allowed size.");
    }

    const frameSize = Serializer.HEADER_SIZE + payloadLength;

    if (buffer.length < frameSize) {
      return null;
    }

    let payload: unknown;

    try {
      payload = JSON.parse(buffer.subarray(Serializer.HEADER_SIZE, frameSize).toString("utf-8"));
    } catch (err) {
      throw new SerializationError("Failed to parse incoming frame JSON payload.", err);
    }

    return {
      packet: {
        opcode,
        payload,
      },
      bytesRead: frameSize,
    };
  }
}
