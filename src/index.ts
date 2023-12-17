import { interval, Observable, Subject, Subscription } from "rxjs";
import { filter, map, take } from "rxjs/operators";

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
   * When set to true, this property enables the timer to automatically 
   * start the next countdown cycle after being paused until the 'stop()' 
   * method is called.
   */
  continue?: boolean;
};

/** Represents the state of the timer */
interface RxTimerState {
  start(): void;
  stop(): void;
  pause(): void;
  resume(): void;
  reset(): void;
}

abstract class RxTimerStateBase {
  constructor(protected timer: RxTimer) { }
}

/**
 * Represents the stable state of the timer when it's not actively counting down.
 * Extends RxTimerStateBase and implements RxTimerState.
 */
class RxTimerStableState extends RxTimerStateBase implements RxTimerState {
  private get isCounting(): boolean {
    return !!this.timer.countingSubscriptions;
  }

  private get isPaused(): boolean {
    return !this.isCounting && this.timer.remaining > 0; // Checks if the timer is paused
  }

  /**
   * Action to start the timer.
   * Changes the state to counting if not already counting and emits START event.
   */
  start(): void {
    // If already counting, do nothing
    if (this.isCounting) return;

    this.timer.setState(new RxTimerCountingState(this.timer));
    this.timer.emitEvent(RxTimerEvent.START);
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
/**
 * Represents the state of the timer when it's actively counting down.
 */
class RxTimerCountingState extends RxTimerStateBase implements RxTimerState {
  private countingSubscriptions: Subscription | null = null; // Subscription for counting

  /**
   * Constructs a new RxTimerCountingState.
   * @param timer The RxTimer instance associated with this state
   */
  constructor(protected timer: RxTimer) {
    super(timer);

    // Start counting
    const isResume = this.timer.remaining > 0;
    if (!isResume) {
      // Reset the start time if not resuming the timer
      this.timer.initTimer();
    }

    this.startTimer();
  }

  private get isCounting(): boolean {
    return !!this.countingSubscriptions; // Checks if timer is actively counting
  }

  /**
   * Action to start the timer (no action if already counting).
   */
  start(): void {
    // No action if already in counting state
    return;
  }

  /**
   * Action to stop the timer.
   * Unsubscribes from counting, resets the timer, and switches to stable state.
   */
  stop(): void {
    if (!this.isCounting) return;

    this.countingSubscriptions?.unsubscribe();
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
    this.countingSubscriptions?.unsubscribe();

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
    this.timer.remaining = 0;
    this.countingSubscriptions?.unsubscribe();
    this.timer.setState(new RxTimerStableState(this.timer));
    this.timer.emitEvent(RxTimerEvent.RESET);
  }

  /**
   * Starts the countdown timer.
   * Handles counting down based on remaining time and emits TICK events.
   */
  private startTimer(): void {
    this.countingSubscriptions = interval(this.timer.remaining).pipe(take(1)).subscribe(() => {
      if (this.timer.options.continue) {
        this.timer.initTimer();
        this.timer.emitEvent(RxTimerEvent.TICK);
        this.startTimer();
      } else {
        this.timer.resetTimer();
        this.timer.emitEvent(RxTimerEvent.TICK);
        this.timer.setState(new RxTimerStableState(this.timer));
      }
    });
  }
}

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

  countingSubscriptions: Subscription | null = null;

  constructor(public duration: number, public options: RxTimerOptions = {}) {
    // Fill in defaults
    const defaultOptions: RxTimerOptions = { continue: false };
    this.options = { ...defaultOptions, ...this.options };

    // initialize state
    this.state = new RxTimerStableState(this);
    this.event$ = new Subject<RxTimerEvent>();
  }

  /**
   * Start the countdown timer.
   * @method
   * @description Initiates the countdown based on the provided duration.
   */
  start(): void {
    this.state.start();
  }

  /**
   * Pause the countdown timer.
   * @method
   * @description Pauses the countdown if it's currently running.
   */
  pause(): void {
    this.state.pause();
  }

  /**
   * Resume the countdown timer.
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
   */
  reset(): void {
    this.state.reset();
  }

  /**
   * Stop the countdown timer.
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
   * Returns an Observable that emits when the timer starts.
   * @returns Observable<void>
   */
  onStart(): Observable<void> {
    return this.event$.pipe(filter(e => e === RxTimerEvent.START), map(() => { }))
  }

  /**
   * Returns an Observable that emits when the timer pauses.
   * @returns Observable<void>
   */
  onPause(): Observable<void> {
    return this.event$.pipe(filter(e => e === RxTimerEvent.PAUSE), map(() => { }))
  }

  /**
   * Returns an Observable that emits when the timer resumes.
   * @returns Observable<void>
   */
  onResume(): Observable<void> {
    return this.event$.pipe(filter(e => e === RxTimerEvent.RESUME), map(() => { }))
  }

  /**
   * Returns an Observable that emits when the timer stops.
   * @returns Observable<void>
   */
  onStop(): Observable<void> {
    return this.event$.pipe(filter(e => e === RxTimerEvent.STOP), map(() => { }))
  }

  /**
   * Returns an Observable that emits on each tick of the timer.
   * @returns Observable<void>
   */
  onTick(): Observable<void> {
    return this.event$.pipe(filter(e => e === RxTimerEvent.TICK), map(() => { }))
  }

  /**
   * Returns an Observable that emits all timer events.
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
