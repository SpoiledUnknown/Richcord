import { DiscordUser } from "./Events.js";
import { Opcode } from "../rpc/Opcodes.js";

/**
 * Low-level packet exchanged over the Discord IPC transport.
 */
export interface IPCPacket {
  readonly opcode: Opcode;
  readonly payload: unknown;
}

/**
 * Outbound RPC command sent to Discord.
 *
 * @template TArgs Type of the command arguments.
 */
export interface RPCCommandPayload<TArgs extends object = Record<string, unknown>> {
  readonly cmd: string;
  readonly args?: TArgs;
  readonly evt?: string | null;
  readonly nonce?: string | null;
}

/**
 * RPC response received from Discord.
 *
 * @template TData Type of the returned data object.
 */
export interface RPCResponsePayload<TData extends object = Record<string, unknown>> {
  readonly cmd: string;
  readonly data: TData;
  readonly evt: string | null;
  readonly nonce: string | null;
}

/**
 * Payload used to initialize a Discord IPC session.
 */
export interface HandshakePayload {
  readonly v: 1;
  readonly client_id: string;
}

/**
 * Payload contained in the `READY` event.
 */
export interface ReadyEventData {
  readonly v: number;

  readonly config: {
    readonly api_endpoint: string;
    readonly cdn_host: string;
    readonly environment: string;
  };

  readonly user: DiscordUser;
}
