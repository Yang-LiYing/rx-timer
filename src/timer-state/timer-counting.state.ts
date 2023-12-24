import { Subscription, interval } from "rxjs";
import { take } from "rxjs/operators";
import { RxTimerEvent } from "..";
import { RxTimerStableState } from "./timer-stable.state";
import { RxTimerState, RxTimerStateBase } from "./timer-state";

/**
 * Represents the state of the timer when it's actively counting down.
 */
export class RxTimerCountingState
  extends RxTimerStateBase
  implements RxTimerState
{
  private countingSubscription: Subscription | null = null; // Subscription for counting

  private get isCounting(): boolean {
    return !!this.countingSubscription; // Checks if timer is actively counting
  }

  /**
   * Action to start the timer (no action if already counting).
   */
  start(): void {
    // Start counting
    const isResume = this.timer.remaining > 0;
    if (!isResume) {
      // Reset the start time if not resuming the timer
      this.timer.initTimer();
      
      this.timer.emitEvent(RxTimerEvent.START);
    }

    this.startTimerImmediately();
  }

  /**
   * Action to stop the timer.
   * Unsubscribes from counting, resets the timer, and switches to stable state.
   */
  stop(): void {
    if (!this.isCounting) return;

    this.countingSubscription?.unsubscribe();
    this.timer.resetTimer();
    this.timer.setState(new RxTimerStableState(this.timer));
    this.timer.emitEvent(RxTimerEvent.STOP);
  }

  /**
   * Action to pause the timer.
   * Unsubscribes from counting and switches to stable state.
   */
  pause(): void {
    if (!this.isCounting) return;
    this.countingSubscription?.unsubscribe();

    this.timer.setState(new RxTimerStableState(this.timer));
    this.timer.emitEvent(RxTimerEvent.PAUSE);
  }

  /**
   * Action to resume the timer (no action as it's already in counting state).
   */
  resume(): void {
    // No action if already in counting state
    return;
  }

  /**
   * Action to reset the timer.
   * Resets remaining time, unsubscribes from counting, and switches to stable state.
   */
  reset(): void {
    if (!this.isCounting) return;
    
    this.countingSubscription?.unsubscribe();
    this.timer.resetTimer();
    this.timer.setState(new RxTimerStableState(this.timer));
    this.timer.emitEvent(RxTimerEvent.RESET);
  }

  /**
   * Starts the countdown timer.
   * Handles counting down based on remaining time and emits TICK events.
   */
  private startTimerImmediately(): void {
    this.countingSubscription = interval(this.timer.remaining)
      .pipe(take(1))
      .subscribe(() => {
        if (this.timer.options.continue) {
          this.timer.initTimer();
          this.timer.emitEvent(RxTimerEvent.TICK);
          this.startTimerImmediately();
        } else {
          this.timer.resetTimer();
          this.timer.emitEvent(RxTimerEvent.TICK);
          this.timer.setState(new RxTimerStableState(this.timer));
        }
      });
  }
}
