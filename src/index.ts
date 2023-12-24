import { Observable, Subject } from "rxjs";
import { filter, map } from "rxjs/operators";
import { RxTimerStableState, RxTimerState } from "./timer-state";

/** Enum representing timer events */
export enum RxTimerEvent {
  START,
  STOP,
  PAUSE,
  RESUME,
  RESET,
  TICK
}

/** Interface for timer options */
export type RxTimerOptions = {
  /**
   * When set to true, this property allows the timer to automatically initiate 
   * the subsequent countdown cycle upon pausing until the 'stop()' method is invoked.
   *
   * Alternatively, it allows pausing through the 'pause()' method and resumes counting 
   * upon the next 'resume()' invocation.
   * 
   * Example:
   * ```typescript
   * cosnt timer = new RxTimer(1000, { continue: true });
   * 
   * timer.onTick().subscribe(() => {
   *   // Receiving a tick event every second
   * });
   * 
   * timer.start();
   * ```
   */
  continue?: boolean;

  /**
   * Specifies the time in milliseconds when the timer should start counting down.
   * If the current time has already passed the specified `beginTime`, the timer
   * will immediately start counting down.
   * 
   * Example:
   * ```typescript
   * const timestamp = new Date('2023-12-22T13:21:39+08:00').getTime();
   * const timer = new RxTimer(1000, { beginTime: timestamp });
   * 
   * timer.onTick().subscribe(() => {
   *   // Starts counting 1 second after 2023-12-22T13:21:39+08:00 and receives tick events
   * });
   * timer.start();
   * ```
   */
  beginTime?: number;
};


/**
 * RxTimer class represents a countdown timer.
 */
export class RxTimer {
  /** Subject for timer events */
  private event$: Subject<RxTimerEvent>;
  /** State of the timer */
  private state: RxTimerState;
  /** Remaining time in the countdown */
  remaining: number = 0;
  /** Start time of the timer */
  startTime: number = -1;

  constructor(public duration: number, public options: RxTimerOptions = {}) {
    // Fill in defaults
    const defaultOptions: RxTimerOptions = { continue: false };
    this.options = { ...defaultOptions, ...this.options };

    // initialize state
    this.state = new RxTimerStableState(this);
    this.event$ = new Subject<RxTimerEvent>();
  }

  /**
   * Initiates a timing cycle based on the provided duration and emits Tick 
   * events upon completion. Pause() can be used to pause the cycle, while stop() 
   * halts the ongoing timing cycle.
   * @method
   * @description Initiates the countdown based on the provided duration.
   */
  start(): void {
    this.state.start();
  }

  /**
   * Pauses the ongoing timer and resumes from the remaining time upon the next 
   * execution of 'resume()'.
   * @method
   * @description Pauses the countdown if it's currently running.
   */
  pause(): void {
    this.state.pause();
  }

  /**
   * Resumes timing from the paused state, continuing the countdown from the 
   * remaining time and triggers the 'Tick' event upon completion.
   * @method
   * @description Resumes the countdown if it's paused and not finished.
   */
  resume(): void {
    this.state.resume();
  }

  /**
   * Reset the countdown timer.
   * @method
   * @description Resets the countdown and clears any active subscription.
   * @deprecated Unable to differentiate distinctions within 'stop()'. 
   * Use 'stop()'. Expected removal in version 2.0.0.
   */
  reset(): void {
    this.state.reset();
  }

  /**
   * Stop the timer and reset the remaining time. Resuming the timer using 
   * 'resume()' is not possible after stopping; it needs to be initiated 
   * again with 'start()' to begin the next timing cycle.
   * @method
   * @description Stops the countdown and completes the timer.
   */
  stop(): void {
    this.state.stop();
  }

  /**
   * Initializes the timer with current time and remaining duration.
   */
  initTimer(): void {
    this.startTime = new Date().getTime();
    this.remaining = this.duration;
  }

  /**
   * Resets the timer to initial values.
   */
  resetTimer(): void {
    this.remaining = 0;
    this.startTime = -1;
  }

  /**
   * Emits a timer event.
   * @param event The timer event to emit
   */
  emitEvent(event: RxTimerEvent): void {
    this.event$.next(event);
  }

  /**
   * Triggers an event to start a brand new timer when 'start()' is invoked.
   * - Note: If the timer is paused, this event won't be received, and the timer 
   * won't restart. Use 'resume()' to resume a paused timer.
   * @returns Observable<void>
   */
  onStart(): Observable<void> {
    return this.event$.pipe(filter(e => e === RxTimerEvent.START), map(() => { }))
  }

  /**
   * Triggers an event to pause the timer upon 'pause()' invocation.
   * - Note: Non-running timers won't receive this event upon 'pause()' invocation. 
   * For timers set with 'beginTime', pausing before the timer starts also won't trigger 
   * this event.
   * @returns Observable<void>
   */
  onPause(): Observable<void> {
    return this.event$.pipe(filter(e => e === RxTimerEvent.PAUSE), map(() => { }))
  }

  /**
   * Upon 'resume()' invocation, triggers an event to resume the timer.
   * @returns Observable<void>
   */
  onResume(): Observable<void> {
    return this.event$.pipe(filter(e => e === RxTimerEvent.RESUME), map(() => { }))
  }

  /**
   * Triggers an event upon invoking 'stop()' while the timer is running.
   * @returns Observable<void>
   */
  onStop(): Observable<void> {
    return this.event$.pipe(filter(e => e === RxTimerEvent.STOP), map(() => { }))
  }

  /**
   * Triggers an event upon completion of a timing cycle.
   * @returns Observable<void>
   */
  onTick(): Observable<void> {
    return this.event$.pipe(filter(e => e === RxTimerEvent.TICK), map(() => { }))
  }

  /**
   * All events related to the timer's state transition can be listened to from here.
   * @returns Observable<RxTimerEventEnum>
   */
  onEvent(): Observable<RxTimerEvent> {
    return this.event$.asObservable();
  }

  /**
   * Sets the state of the timer.
   * @param state The new state for the timer
   */
  setState(state: RxTimerState): void {
    this.state = state;
  }
}
