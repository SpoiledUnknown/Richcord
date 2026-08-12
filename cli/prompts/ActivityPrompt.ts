import { input, select, confirm } from "@inquirer/prompts";
import { ActivityType } from "../../src/index.js";
import type {
  SerializedActivity,
  SerializedButton,
  SerializedAssets,
  SerializedTimestamps,
} from "../types/CLIConfig.js";

export async function promptActivity(current?: SerializedActivity): Promise<SerializedActivity> {
  const type = await select<ActivityType>({
    message: "Select Activity Type:",
    default: current?.type ?? ActivityType.Playing,
    choices: [
      { name: "Playing", value: ActivityType.Playing },
      { name: "Streaming", value: ActivityType.Streaming },
      { name: "Listening", value: ActivityType.Listening },
      { name: "Watching", value: ActivityType.Watching },
      { name: "Custom", value: ActivityType.Custom },
      { name: "Competing", value: ActivityType.Competing },
    ],
  });

  const details = await input({
    message: "Details (Line 1):",
    default: current?.details ?? "",
  });

  const state = await input({
    message: "State (Line 2):",
    default: current?.state ?? "",
  });

  // Timestamps
  const addTimestamps = await confirm({
    message: "Include timestamps?",
    default: Boolean(current?.timestamps),
  });

  let timestamps: SerializedTimestamps | undefined;

  if (addTimestamps) {
    const timeChoice = await select<"now" | "custom">({
      message: "Timestamp mode:",
      choices: [
        { name: "Start timer now", value: "now" },
        {
          name: "Specify custom start timestamp (epoch ms)",
          value: "custom",
        },
      ],
    });

    if (timeChoice === "now") {
      timestamps = {
        start: Date.now(),
      };
    } else {
      const startVal = await input({
        message: "Start Epoch Timestamp (ms):",
        default: current?.timestamps?.start ? String(current.timestamps.start) : String(Date.now()),
        validate: (val) => (!isNaN(Number(val)) ? true : "Please enter a valid numeric timestamp."),
      });

      timestamps = {
        start: Number(startVal),
      };
    }
  }

  // Assets
  const addAssets = await confirm({
    message: "Configure Rich Presence images/assets?",
    default: Boolean(current?.assets),
  });

  let assets: SerializedAssets | undefined;

  if (addAssets) {
    const largeImage = await input({
      message: "Large Image Key / URL:",
      default: current?.assets?.largeImage ?? "",
    });

    const largeText = await input({
      message: "Large Image Tooltip Text:",
      default: current?.assets?.largeText ?? "",
    });

    const smallImage = await input({
      message: "Small Image Key / URL:",
      default: current?.assets?.smallImage ?? "",
    });

    const smallText = await input({
      message: "Small Image Tooltip Text:",
      default: current?.assets?.smallText ?? "",
    });

    if (largeImage || largeText || smallImage || smallText) {
      assets = {};

      if (largeImage) {
        assets.largeImage = largeImage;
      }

      if (largeText) {
        assets.largeText = largeText;
      }

      if (smallImage) {
        assets.smallImage = smallImage;
      }

      if (smallText) {
        assets.smallText = smallText;
      }
    }
  }

  // Buttons
  const addButtons = await confirm({
    message: "Configure action buttons (max 2)?",
    default: Boolean(current?.buttons && current.buttons.length > 0),
  });

  const buttons: SerializedButton[] = [];

  if (addButtons) {
    const btn1Label = await input({
      message: "Button 1 Label:",
      default: current?.buttons?.[0]?.label ?? "",
    });

    const btn1Url = await input({
      message: "Button 1 URL:",
      default: current?.buttons?.[0]?.url ?? "",
    });

    if (btn1Label && btn1Url) {
      buttons.push({
        label: btn1Label,
        url: btn1Url,
      });

      const addSecond = await confirm({
        message: "Add second button?",
        default: Boolean(current?.buttons?.[1]),
      });

      if (addSecond) {
        const btn2Label = await input({
          message: "Button 2 Label:",
          default: current?.buttons?.[1]?.label ?? "",
        });

        const btn2Url = await input({
          message: "Button 2 URL:",
          default: current?.buttons?.[1]?.url ?? "",
        });

        if (btn2Label && btn2Url) {
          buttons.push({
            label: btn2Label,
            url: btn2Url,
          });
        }
      }
    }
  }

  const instance = await confirm({
    message: "Is game session instance?",
    default: current?.instance ?? false,
  });

  const activity: SerializedActivity = {
    type,
    instance,
  };

  if (details) {
    activity.details = details;
  }

  if (state) {
    activity.state = state;
  }

  if (timestamps) {
    activity.timestamps = timestamps;
  }

  if (assets) {
    activity.assets = assets;
  }

  if (buttons.length > 0) {
    activity.buttons = buttons;
  }

  return activity;
}
