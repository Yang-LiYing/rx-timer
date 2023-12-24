import { Subscription, interval } from "rxjs";
import { RxTimerState, RxTimerStateBase } from "./timer-state";
import { RxTimerCountingState } from "./timer-counting.state";
import { take } from "rxjs/operators";
import { RxTimerStableState } from "./timer-stable.state";

/**
 * Represents the state of the RxTimer when it's counting down to the specified beginTime.
 */
export class RxTimerCountingToBeginTimeState
  extends RxTimerStateBase
  implements RxTimerState
{
  private beginTimeSubscription: Subscription | null = null;

  private get isCounting(): boolean {
    return !!this.beginTimeSubscription;
  }

  /**
   * Starts counting down to the specified beginTime.
   * @method
   */
  start(): void {
    if (this.isCounting) return;

    const beginTime = this.timer.options.beginTime;
    if (!beginTime) return;

    this.startTimerFromBeginning(beginTime);
  }

  /**
   * Stops the countdown to the specified beginTime.
   * @method
   */
  stop(): void {
    this.stopCountingToBeginTime();
  }

  /**
   * Pauses the countdown to the specified beginTime.
   * @method
   */
  pause(): void {
    this.stopCountingToBeginTime();
  }

  /**
   * Resumes the countdown (no action).
   * @method
   */
  resume(): void {
    // No action if already in counting to begin time state
    return;
  }

  /**
   * Resets the countdown to the specified beginTime.
   * @method
   */
  reset(): void {
    this.stopCountingToBeginTime();
  }

  /**
   * Stops the countdown to the specified beginTime.
   * Unsubscribes from the interval and sets the timer state to stable.
   * @private
   */
  private stopCountingToBeginTime(): void {
    if (!this.isCounting) return;

    this.beginTimeSubscription?.unsubscribe();
    this.timer.setState(new RxTimerStableState(this.timer));
  }

  /**
   * Starts the countdown to the specified beginTime.
   * Calculates the time difference and initiates counting down or starts immediately if the time has passed.
   * @param beginTime The specified time to begin the timer
   * @private
   */
  private startTimerFromBeginning(beginTime: number): void {
    const timeDifferenceToBeginTimer = beginTime - new Date().getTime();

    if (timeDifferenceToBeginTimer < 0) {
      this.timer.setState(new RxTimerCountingState(this.timer));
      this.timer.start();
    } else {
      this.beginTimeSubscription = interval(timeDifferenceToBeginTimer)
        .pipe(take(1))
        .subscribe(() => {
          this.timer.setState(new RxTimerCountingState(this.timer));
          this.timer.start();
        });
    }
  }
}
