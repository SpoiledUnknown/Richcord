import { ValidationError } from "../errors/ValidationError.js";
import { Activity, ActivityButton } from "../types/Activity.js";
import { RPCConstraints } from "./Constants.js";

export class Validation {
  public static validateClientId(clientId: string): void {
    const trimmed = clientId.trim();

    if (trimmed.length === 0) {
      throw new ValidationError("Client ID must be a non-empty string.");
    }

    if (!/^\d{17,20}$/.test(trimmed)) {
      throw new ValidationError(
        `Client ID must be a valid Discord snowflake (17 to 20 numeric digits).`
      );
    }
  }

  public static validateActivity(activity: Activity): void {
    if (!activity || typeof activity !== "object") {
      throw new ValidationError("Activity payload must be a valid non-null object.");
    }

    // Details & State
    Validation.validateString("details", activity.details, RPCConstraints.MAX_DETAILS_LENGTH);
    Validation.validateString("state", activity.state, RPCConstraints.MAX_STATE_LENGTH);

    // Timestamps
    if (activity.timestamps) {
      const startMs = Validation.validateTimestamp(activity.timestamps.start, "timestamps.start");
      const endMs = Validation.validateTimestamp(activity.timestamps.end, "timestamps.end");

      if (startMs !== undefined && endMs !== undefined && endMs < startMs) {
        throw new ValidationError(
          `Activity timestamps.end (${endMs}) cannot be earlier than timestamps.start (${startMs}).`
        );
      }
    }

    // Assets
    if (activity.assets) {
      Validation.validateString(
        "assets.largeImage",
        activity.assets.largeImage,
        RPCConstraints.MAX_ASSET_KEY_LENGTH
      );

      Validation.validateString(
        "assets.largeText",
        activity.assets.largeText,
        RPCConstraints.MAX_ASSET_TEXT_LENGTH
      );

      Validation.validateString(
        "assets.smallImage",
        activity.assets.smallImage,
        RPCConstraints.MAX_ASSET_KEY_LENGTH
      );

      Validation.validateString(
        "assets.smallText",
        activity.assets.smallText,
        RPCConstraints.MAX_ASSET_TEXT_LENGTH
      );
    }

    // Party
    if (activity.party) {
      Validation.validateString("party.id", activity.party.id, RPCConstraints.MAX_PARTY_ID_LENGTH);

      if (activity.party.size !== undefined) {
        if (!Array.isArray(activity.party.size) || activity.party.size.length !== 2) {
          throw new ValidationError(
            "Activity party.size must be a tuple of two numbers: [currentSize, maxSize]."
          );
        }

        const [currentSize, maxSize] = activity.party.size;

        if (!Number.isInteger(currentSize) || currentSize < 0) {
          throw new ValidationError(
            `Activity party.size[0] (currentSize) must be a non-negative integer. Received: ${currentSize}`
          );
        }

        if (!Number.isInteger(maxSize) || maxSize <= 0) {
          throw new ValidationError(
            `Activity party.size[1] (maxSize) must be a positive integer. Received: ${maxSize}`
          );
        }

        if (currentSize > maxSize) {
          throw new ValidationError(
            `Activity party.size[0] (${currentSize}) cannot exceed party.size[1] (${maxSize}).`
          );
        }
      }
    }

    // Secrets
    if (activity.secrets) {
      Validation.validateString(
        "secrets.join",
        activity.secrets.join,
        RPCConstraints.MAX_SECRET_LENGTH
      );

      Validation.validateString(
        "secrets.spectate",
        activity.secrets.spectate,
        RPCConstraints.MAX_SECRET_LENGTH
      );

      Validation.validateString(
        "secrets.match",
        activity.secrets.match,
        RPCConstraints.MAX_SECRET_LENGTH
      );
    }

    // Buttons
    if (activity.buttons) {
      if (!Array.isArray(activity.buttons)) {
        throw new ValidationError("Activity buttons must be an array.");
      }

      if (activity.buttons.length > RPCConstraints.MAX_BUTTONS_COUNT) {
        throw new ValidationError(
          `Activity buttons array cannot contain more than 2 buttons. Received: ${activity.buttons.length}`
        );
      }

      activity.buttons.forEach((btn, index) => {
        if (btn) {
          Validation.validateButton(btn, index);
        }
      });
    }
  }

  private static validateString(
    fieldName: string,
    value: string | undefined,
    maxLength: number
  ): void {
    if (value === undefined) {
      return;
    }

    if (typeof value !== "string") {
      throw new ValidationError(`Activity field '${fieldName}' must be a string.`);
    }

    if (value.trim().length === 0) {
      throw new ValidationError(
        `Activity field '${fieldName}' cannot be empty or whitespace-only.`
      );
    }

    if (value.length > maxLength) {
      throw new ValidationError(
        `Activity field '${fieldName}' exceeds maximum length of ${maxLength} characters (length: ${value.length}).`
      );
    }
  }

  private static validateTimestamp(
    value: number | Date | undefined,
    fieldName: string
  ): number | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (value instanceof Date) {
      const time = value.getTime();
      if (Number.isNaN(time)) {
        throw new ValidationError(`Activity field '${fieldName}' contains an invalid Date object.`);
      }
      return time;
    }

    if (typeof value === "number") {
      if (!Number.isFinite(value) || value < 0) {
        throw new ValidationError(
          `Activity field '${fieldName}' must be a non-negative finite number.`
        );
      }
      return value;
    }

    throw new ValidationError(
      `Activity field '${fieldName}' must be a Date or a numeric Unix timestamp in milliseconds.`
    );
  }

  private static validateButton(button: ActivityButton, index: number): void {
    const prefix = `Activity button[${index}]`;

    if (!button || typeof button !== "object") {
      throw new ValidationError(`${prefix} must be a valid non-null object.`);
    }

    if (typeof button.label !== "string" || button.label.trim().length === 0) {
      throw new ValidationError(`${prefix} label must be a non-empty string.`);
    }

    if (button.label.length > RPCConstraints.MAX_BUTTON_LABEL_LENGTH) {
      throw new ValidationError(
        `${prefix} label exceeds maximum length of 32 characters (length: ${button.label.length}).`
      );
    }

    if (typeof button.url !== "string" || button.url.trim().length === 0) {
      throw new ValidationError(`${prefix} url must be a non-empty string.`);
    }

    if (button.url.length > RPCConstraints.MAX_BUTTON_URL_LENGTH) {
      throw new ValidationError(
        `${prefix} url exceeds maximum length of 512 characters (length: ${button.url.length}).`
      );
    }

    try {
      const parsedUrl = new URL(button.url.trim());
      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        throw new ValidationError(
          `${prefix} url protocol must be 'http:' or 'https:'. Received: '${parsedUrl.protocol}'`
        );
      }
    } catch (err) {
      if (err instanceof ValidationError) {
        throw err;
      }
      throw new ValidationError(`${prefix} url '${button.url}' is not a valid HTTP/HTTPS URL.`);
    }
  }
}
