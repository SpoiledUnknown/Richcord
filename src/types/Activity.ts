/**
 * Activity types defined by the Discord Rich Presence protocol.
 *
 * The numeric values are part of Discord's IPC specification
 * and must not be changed.
 */
export enum ActivityType {
  Playing = 0,
  Streaming = 1,
  Listening = 2,
  Watching = 3,
  Custom = 4,
  Competing = 5,
}

/**
 * Start/end timestamps.
 * Date values are converted to Unix seconds during serialization.
 */
export interface ActivityTimestamps {
  readonly start?: number | Date;
  readonly end?: number | Date;
}

/**
 * Visual asset keys and hover texts for large/small Rich Presence images.
 */
export interface ActivityAssets {
  readonly largeImage?: string;
  readonly largeText?: string;
  readonly smallImage?: string;
  readonly smallText?: string;
}

/**
 * Party status for multiplayer or group activities.
 */
export interface ActivityParty {
  readonly id?: string;
  readonly size?: readonly [currentSize: number, maxSize: number];
}

/**
 * Secret tokens for joining, spectating, or matching game sessions.
 */
export interface ActivitySecrets {
  readonly join?: string;
  readonly spectate?: string;
  readonly match?: string;
}

/**
 * Interactive button configuration shown on the Rich Presence profile.
 */
export interface ActivityButton {
  readonly label: string;
  readonly url: string;
}

/**
 * Rich Presence activity sent to Discord.
 */
export interface Activity {
  readonly details?: string;
  readonly state?: string;
  readonly type?: ActivityType;

  readonly timestamps?: ActivityTimestamps;
  readonly assets?: ActivityAssets;
  readonly party?: ActivityParty;
  readonly secrets?: ActivitySecrets;

  readonly buttons?: readonly [ActivityButton, ActivityButton?];

  readonly instance?: boolean;
}
