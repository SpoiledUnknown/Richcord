import {
  RichcordClient,
  ClientState,
  RichcordError,
  ValidationError,
  ActivityType,
  RPCCommands,
  RPCConstraints,
  Defaults,
} from "richcord";
import type { Activity, RichcordClientOptions } from "richcord";

let client: RichcordClient | undefined;
let state: ClientState = ClientState.Disconnected;
let actType: ActivityType = ActivityType.Playing;
let err: RichcordError = new ValidationError("CJS test error");

let options: RichcordClientOptions = {
  clientId: "123456789012345678",
};

let activity: Activity = {
  type: actType,
  details: "CommonJS TypeScript compatibility test",
};

void client;
void state;
void actType;
void err;
void options;
void activity;
void RPCCommands;
void RPCConstraints;
void Defaults;
