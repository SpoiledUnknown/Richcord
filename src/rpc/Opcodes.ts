/**
 * Opcodes used in the Discord IPC protocol framing specification.
 */
export enum Opcode {
  HANDSHAKE = 0,
  FRAME = 1,
  CLOSE = 2,
  PING = 3,
  PONG = 4,
}
