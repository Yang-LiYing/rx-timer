import { RxTimer } from "..";

/** Represents the state of the timer */
export interface RxTimerState {
  start(): void;
  stop(): void;
  pause(): void;
  resume(): void;
  reset(): void;
}

export abstract class RxTimerStateBase {
  constructor(protected timer: RxTimer) {}
}
