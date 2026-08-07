/**
 * Represents the Discord user included in the READY event.
 */
export interface DiscordUser {
  readonly id: string;
  readonly username: string;
  readonly discriminator: string;
  readonly avatar: string | null;
  readonly flags?: number;
}

/**
 * Strongly typed event map for the Richcord client.
 */
export interface ClientEvents {
  connected: () => void;
  ready: (user: DiscordUser) => void;
  disconnected: (reason?: string) => void;
  error: (error: Error) => void;
  reconnecting: (attempt: number) => void;
}
