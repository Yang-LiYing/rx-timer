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
const timer = new RxTimer({ continue: true });
```

### `beginTime`
Specifies the time in milliseconds when the timer should start counting down. If the current time has already passed the specified `beginTime`, the timer will immediately start counting down.

```typescript
const timestamp = new Date('2023-12-22T13:21:39+08:00').getTime();
const timer = new RxTimer(1000, { beginTime: timestamp });
```

### Methods

#### `start()`

Initiates a timing cycle based on the provided duration and emits Tick events upon completion. Pause() can be used to pause the cycle, while stop() halts the ongoing timing cycle.

```typescript
timer.start();
```

#### `pause()`

Pauses the ongoing timer and resumes from the remaining time upon the next execution of 'resume()'.

```typescript
timer.pause();
```

#### `resume()`

Resumes timing from the paused state, continuing the countdown from the remaining time and triggers the 'Tick' event upon completion.

```typescript
timer.resume();
```

#### ~~`reset()`~~

Resets the countdown and clears any active subscription.
- __Deprecated:__ Unable to differentiate distinctions within 'stop()'. Use 'stop()'. Expected removal in version 2.0.0.

```typescript
timer.reset();
```

#### `stop()`

Stop the timer and reset the remaining time. Resuming the timer using 'resume()' is not possible after stopping; it needs to be initiated again with 'start()' to begin the next timing cycle.

```typescript
timer.stop();
```

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
