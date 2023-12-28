# RxTimer

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js CI](https://github.com/Yang-LiYing/rx-timer/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/Yang-LiYing/rx-timer/actions/workflows/test.yml)

RxTimer is a utility for countdown timers, offering observable events for timer management in various applications.

## Installation

To install the RxTimer utility, use npm:

```bash
npm install --save rx-timer
```

## Usage

Import the `RxTimer` class into your project:

```typescript
import { RxTimer, RxTimerEvent } from "rx-timer";
```

Create an instance of `RxTimer` and start:

```typescript
const timer = new RxTimer(5000); // Timer duration: 5000 milliseconds (5 seconds)
timer.start();
```

### API

- Options
  - [continue](#continue)
  - [beginTime](#begintime)
- Methods
  - [start()](#start)
  - [pause()](#pause)
  - [resume()](#resume)
  - [~~reset()~~](#reset)
  - [stop()](#stop)
  - [isCounting()](#iscounting)
  - [isStopped()](#isstopped)
  - [isPaused()](#ispaused)
  - [getRemainingMilliseconds()](#getremainingmilliseconds)
- Observable
  - [onStart()](#onstart)
  - [onPause()](#onpause)
  - [onResume()](#onresume)
  - [onStop()](#onstop)
  - [onTick()](#ontick)
  - [onEvent()](#onevent)

### Options

#### `continue`

When set to true, this property allows the timer to automatically initiate the subsequent countdown cycle upon pausing until the 'stop()' method is invoked.

Alternatively, it allows pausing through the 'pause()' method and resumes counting upon the next 'resume()' invocation.

```typescript
const timer = new RxTimer(1000, { continue: true });

timer.start(); // timer will emit onTick at every second
```

### `beginTime`

Specifies the time in milliseconds when the timer should start counting down. If the current time has already passed the specified `beginTime`, the timer will immediately start counting down.

```typescript
const timestamp = new Date("2023-12-22T13:21:39+08:00").getTime();
const timer = new RxTimer(1000, { beginTime: timestamp });

timer.start(); // timer will start with 2023-12-22T13:21:39+08:00
```

### Methods

#### `start()`

Initiates a timing cycle based on the provided duration and emits Tick events upon completion. Pause() can be used to pause the cycle, while stop() halts the ongoing timing cycle.

```typescript
const timer = new RxTimer(1000);

timer.start(); // start to counting
```

#### `pause()`

Pauses the ongoing timer and resumes from the remaining time upon the next execution of 'resume()'.

```typescript
const timer = new RxTimer(1000);

timer.start();

setTimeout(() => {
  timer.pause(); // pauses the timer after 500 milliseconds
}, 500);
```

#### `resume()`

Resumes timing from the paused state, continuing the countdown from the remaining time and triggers the 'Tick' event upon completion.

```typescript
const timer = new RxTimer(1000);

timer.start();

setTimeout(() => {
  timer.pause(); // pauses the timer after 500 milliseconds

  timer.resume(); // resumes the timer immediately after pausing and continues the remaining 500ms
}, 500);
```

#### ~~`reset()`~~

Resets the countdown and clears any active subscription.

- **Deprecated:** Unable to differentiate distinctions within 'stop()'. Use 'stop()'. Expected removal in version 2.0.0.

```typescript
const timer = new RxTimer(1000);

timer.start(); // start counting

timer.reset(); // reset counting
```

#### `stop()`

Stop the timer and reset the remaining time. Resuming the timer using 'resume()' is not possible after stopping; it needs to be initiated again with 'start()' to begin the next timing cycle.

```typescript
const timer = new RxTimer(1000);
timer.start(); // start counting

timer.stop(); // stop counting
```

#### `isCounting()`

Checks if the timer is currently in a counting state.

```typescript
const timer = new RxTimer(1000);

timer.isCounting(); // false

timer.start();

timer.isCounting(); // true
```

#### `isStopped()`

Checks if the timer is currently in a stopped state.

```typescript
const timer = new RxTimer(1000);

timer.isStopped(); // true

timer.start();

timer.isStopped(); // false
```

#### `isPaused()`

Checks if the timer is currently in a paused state.

```typescript
const timer = new RxTimer(1000);

timer.start();

timer.isPaused(); // false

timer.pause();

timer.isPaused(); // true
```

#### `getRemainingMilliseconds()`

Retrieves the remaining time on the timer in milliseconds.

```typescript
const timer = new RxTimer(1000);

timer.getRemainingMilliseconds(); // 0

timer.start();

setTimeout(() => {
  timer.getRemainingMilliseconds(); // 487
}, 500);
```

```typescript
const timer = new RxTimer(1000, { beginTime: new Date().getTime() + 1000 });

timer.start();

setTimeout(() => {
  timer.getRemainingMilliseconds(); // 0
}, 500);

setTimeout(() => {
  timer.getRemainingMilliseconds(); // 498
}, 1500);
```

Note: When the specified `beginTime` has not yet been reached, `getRemainingMilliseconds()` will return 0, and the timer state will be considered as 'stopped'.

### Observables

#### `onStart()`

Triggers an event to start a brand new timer when 'start()' is invoked.
Note: If the timer is paused, this event won't be received, and the timer won't restart. Use 'resume()' to resume a paused timer.

```typescript
timer.onStart().subscribe(() => {
  // Handle start event
});
```

#### `onPause()`

Triggers an event to pause the timer upon 'pause()' invocation.
Note: Non-running timers won't receive this event upon 'pause()' invocation. For timers set with 'beginTime', pausing before the timer starts also won't trigger this event.

```typescript
timer.onPause().subscribe(() => {
  // Handle pause event
});
```

#### `onResume()`

Upon 'resume()' invocation, triggers an event to resume the timer.

```typescript
timer.onResume().subscribe(() => {
  // Handle resume event
});
```

#### `onStop()`

Triggers an event upon invoking 'stop()' while the timer is running.

```typescript
timer.onStop().subscribe(() => {
  // Handle stop event
});
```

#### `onTick()`

Triggers an event upon completion of a timing cycle.

```typescript
timer.onTick().subscribe(() => {
  // Handle tick event
});
```

#### `onEvent()`

All events related to the timer's state transition can be listened to from here.

```typescript
timer.onEvent().subscribe((event: RxTimerEvent) => {
  // Handle any timer event
});
```

## Example

```typescript
const timer = new RxTimer(10000); // Timer duration: 10 seconds

timer.onTick().subscribe(() => {
  console.log("Tick!");
});

timer.start();
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
