# RxTimer

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

RxTimer is a timer utility leveraging RxJS for countdown functionality.

## Features

- **Start Timer**: Begin the countdown.
- **Pause Timer**: Temporarily pause an ongoing countdown.
- **Resume Timer**: Resume a paused countdown.
- **Reset Timer**: Reset the countdown to its initial state.
- **Stop Timer**: Halt the countdown.

## Usage

```typescript
import { RxTimer } from 'path/to/RxTimer';

// Create a timer with a duration of 10 seconds
const timer = new RxTimer(10000);

// Subscribe to the 'onTick' event
timer.onTick().subscribe(() => {
  // Handle onTick event
});

// Start the timer
timer.start();

// Pause the timer
timer.pause();

// Resume the timer
timer.resume();

// Reset the timer
timer.reset();

// Stop the timer
timer.stop();
```

## Installation

To install RxTimer, you can use npm:

```bash
npm install --save rx-timer
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.