# RxTimer

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

RxTimer is a countdown timer utility with observable events for managing timers in Angular applications.

## Installation

To install the RxTimer utility, use npm:

```bash
npm install --save rx-timer
```

## Usage

Import the `RxTimer` class into your Angular component or service:

```typescript
import { RxTimer, RxTimerEvent } from 'rx-timer';
```

Create an instance of `RxTimer`:

```typescript
const timer = new RxTimer(5000); // Timer duration: 5000 milliseconds (5 seconds)
```

### Methods

#### `start()`

Starts the countdown timer.

```typescript
timer.start();
```

#### `pause()`

Pauses the countdown timer if it's currently running.

```typescript
timer.pause();
```

#### `resume()`

Resumes the countdown timer if it's paused and not finished.

```typescript
timer.resume();
```

#### `reset()`

Resets the countdown and clears any active subscription.

```typescript
timer.reset();
```

#### `stop()`

Stops the countdown and completes the timer.

```typescript
timer.stop();
```

### Observables

#### `onStart()`

Returns an Observable that emits when the timer starts.

```typescript
timer.onStart().subscribe(() => {
  // Handle start event
});
```

#### `onPause()`

Returns an Observable that emits when the timer pauses.

```typescript
timer.onPause().subscribe(() => {
  // Handle pause event
});
```

#### `onResume()`

Returns an Observable that emits when the timer resumes.

```typescript
timer.onResume().subscribe(() => {
  // Handle resume event
});
```

#### `onStop()`

Returns an Observable that emits when the timer stops.

```typescript
timer.onStop().subscribe(() => {
  // Handle stop event
});
```

#### `onTick()`

Returns an Observable that emits on each tick of the timer.

```typescript
timer.onTick().subscribe(() => {
  // Handle tick event
});
```

#### `onEvent()`

Returns an Observable that emits all timer events.

```typescript
timer.onEvent().subscribe((event: RxTimerEvent) => {
  // Handle any timer event
});
```

## Example

```typescript
const timer = new RxTimer(10000); // Timer duration: 10 seconds

timer.onTick().subscribe(() => {
  console.log('Tick!');
});

timer.start();
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.