import {
  Observable,
  SchedulerLike,
  Subject,
  Subscription,
  interval,
  race,
} from "rxjs";
import { takeUntil } from "rxjs/operators";

/**
 * RxTimer - A timer utility using RxJS for countdown functionality.
 * @class
 * @description
 * This utility provides functionalities to manage a countdown timer using RxJS Observables.
 * It supports starting, pausing, resuming, resetting, and stopping the countdown.
 *
 * @example
 * // Create a timer with a duration of 10 seconds
 * const timer = new RxTimer(10000);
 *
 * // Subscribe to the 'onTick' event
 * timer.onTick().subscribe(() => {
 *   // Handle onTick event
 * });
 *
 * // Start the timer
 * timer.start();
 *
 * // Pause the timer
 * timer.pause();
 *
 * // Resume the timer
 * timer.resume();
 *
 * // Reset the timer
 * timer.reset();
 *
 * // Stop the timer
 * timer.stop();
 */
export class RxTimer {
  private tick$ = new Subject<void>();
  private stop$ = new Subject<void>();
  private pause$ = new Subject<void>();
  /** 倒數剩餘數 */
  private remaining: number = 0;
  private startTime: number = -1;

  private countingSubscriptions: Subscription | null = null;

  constructor(private duration: number) {}

  /**
   * Start the countdown timer.
   * @method
   * @description Initiates the countdown based on the provided duration.
   */
  start(): void {
    this.startCount(this.duration);
  }

  /**
   * Pause the countdown timer.
   * @method
   * @description Pauses the countdown if it's currently running.
   */
  pause(): void {
    if (!this.countingSubscriptions) return;
    this.pause$.next();
  }

  /**
   * Resume the countdown timer.
   * @method
   * @description Resumes the countdown if it's paused and not finished.
   */
  resume(): void {
    const isFinished = this.remaining === 0;
    if (this.countingSubscriptions || isFinished) return;
    this.startCount(this.remaining);
  }

  /**
   * Reset the countdown timer.
   * @method
   * @description Resets the countdown and clears any active subscription.
   */
  reset(): void {
    this.countingSubscriptions?.unsubscribe();
    this.countingSubscriptions = null;
    this.remaining = 0;
  }

  /**
   * Stop the countdown timer.
   * @method
   * @description Stops the countdown and completes the timer.
   */
  stop(): void {
    this.stop$.next();
  }

  private startCount(duration: number): void {
    if (this.countingSubscriptions) return;
    // 重置倒數計時的剩餘時間
    this.remaining = duration;
    this.startTime = new Date().getTime();
    this.countingSubscriptions = race(
      interval(this.remaining),
      this.pause$
    )
      .pipe(takeUntil(race(this.stop$, this.tick$)))
      .subscribe(
        () => {
          const currentTime = new Date().getTime();
          const remaining = this.remaining - (currentTime - this.startTime);
          if (remaining > 0) {
            // pause
            this.remaining = remaining;
          } else {
            // done
            this.tick$.next();
          }
          this.countingSubscriptions?.unsubscribe();
          this.countingSubscriptions = null;
        },
        () => {},
        () => {
          // complete
          this.remaining = 0;
          this.countingSubscriptions = null;
        }
      );
  }

  /**
   * Subscribe to the 'onTick' event.
   * @method
   * @description Returns an Observable that emits when the timer ticks.
   * @returns Observable<void>
   */
  onTick(): Observable<void> {
    return this.tick$.asObservable();
  }
}
