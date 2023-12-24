import { RxTimerEvent } from "..";
import { RxTimerCountingToBeginTimeState } from "./timer-counting-to-begin-time.state";
import { RxTimerCountingState } from "./timer-counting.state";
import { RxTimerStateBase, RxTimerState } from "./timer-state";

/**
 * Represents the stable state of the timer when it's not actively counting down.
 * Extends RxTimerStateBase and implements RxTimerState.
 */
export class RxTimerStableState extends RxTimerStateBase implements RxTimerState {
  private get isPaused(): boolean {
    return this.timer.remaining > 0; // Checks if the timer is paused
  }

  /**
   * Action to start the timer.
   * Changes the state to counting if not already counting and emits START event.
   */
  start(): void {
    if(this.timer.options.beginTime) {
      this.timer.setState(new RxTimerCountingToBeginTimeState(this.timer));
      this.timer.start();
    } else {
      this.timer.setState(new RxTimerCountingState(this.timer));
      this.timer.start();
    }
  }

  /**
   * Action to stop the timer.
   * Resets the timer and emits STOP event if it's paused.
   */
  stop(): void {
    // If not paused, do nothing
    if (!this.isPaused) return;

    this.timer.resetTimer();
    this.timer.emitEvent(RxTimerEvent.STOP);
  }

  /**
   * Action to pause the timer (no action in the stable state).
   */
  pause(): void {
    return; // No action in the stable state
  }

  /**
   * Action to resume the timer.
   * Changes the state to counting if paused and emits RESUME event.
   */
  resume(): void {
    // If not paused, do nothing
    if (!this.isPaused) return;

    this.timer.setState(new RxTimerCountingState(this.timer));
    this.timer.start();
    this.timer.emitEvent(RxTimerEvent.RESUME);
  }

  /**
   * Action to reset the timer.
   * Resets the timer and emits RESET event if it's paused.
   */
  reset(): void {
    // If not paused, do nothing
    if (!this.isPaused) return;

    this.timer.resetTimer();
    this.timer.emitEvent(RxTimerEvent.RESET);
  }
}