import { ClientNotConnectedError } from "../errors/ClientNotConnectedError.js";

export enum ClientState {
  Disconnected = "Disconnected",
  Connecting = "Connecting",
  Connected = "Connected",
  Handshaking = "Handshaking",
  Ready = "Ready",
  Disconnecting = "Disconnecting",
}

export class StateMachine {
  private currentState: ClientState = ClientState.Disconnected;

  private static readonly AllowedTransitions: Readonly<
    Record<ClientState, readonly ClientState[]>
  > = {
    [ClientState.Disconnected]: [ClientState.Connecting],

    [ClientState.Connecting]: [
      ClientState.Connected,
      ClientState.Disconnecting,
      ClientState.Disconnected,
    ],

    [ClientState.Connected]: [
      ClientState.Handshaking,
      ClientState.Disconnecting,
      ClientState.Disconnected,
    ],

    [ClientState.Handshaking]: [
      ClientState.Ready,
      ClientState.Disconnecting,
      ClientState.Disconnected,
    ],

    [ClientState.Ready]: [ClientState.Disconnecting, ClientState.Disconnected],

    [ClientState.Disconnecting]: [ClientState.Disconnected],
  };

  public get state(): ClientState {
    return this.currentState;
  }

  public is(targetState: ClientState): boolean {
    return this.currentState === targetState;
  }

  public assertReady(): void {
    if (this.currentState !== ClientState.Ready) {
      throw new ClientNotConnectedError(
        `Operation invalid in state '${this.currentState}'. Client must be in state '${ClientState.Ready}'.`
      );
    }
  }

  public transitionTo(newState: ClientState): void {
    if (this.currentState === newState) {
      return;
    }

    const allowedNextStates = StateMachine.AllowedTransitions[this.currentState];

    if (!allowedNextStates.includes(newState)) {
      throw new Error(
        `Illegal state transition requested: Cannot transition from '${this.currentState}' to '${newState}'.`
      );
    }

    this.currentState = newState;
  }

  public forceReset(): void {
    this.currentState = ClientState.Disconnected;
  }
}
