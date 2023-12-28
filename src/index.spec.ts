import { filter, take } from "rxjs/operators";
import { RxTimer, RxTimerEvent } from ".";
describe("RxTimer", () => {
  it("should emit onTick event.", (done) => {
    const timer = new RxTimer(25);
    let ticked = false;

    timer.onTick().subscribe(() => (ticked = true));

    timer.start();

    setTimeout(() => {
      expect(ticked).toBe(true);
      done();
    }, 50);
  });

  it("should emit onTick event after pause and resume.", (done) => {
    const timer = new RxTimer(50);
    let tick = false;

    timer
      .onEvent()
      .pipe(
        filter((e) => e === RxTimerEvent.TICK),
        take(1)
      )
      .subscribe(() => (tick = true));

    timer.start();

    setTimeout(() => {
      timer.pause();

      setTimeout(() => {
        timer.resume();

        setTimeout(() => {
          expect(tick).toBe(true);
          done();
        }, 50);
      }, 25);
    }, 25);
  });

  it("should not receive onTick event after calling stop.", (done) => {
    const timer = new RxTimer(50);
    let ticked = false;

    timer.onTick().subscribe(() => (ticked = true));

    timer.start();

    setTimeout(() => {
      timer.stop();
      setTimeout(() => {
        expect(ticked).toBe(false);
        done();
      }, 40);
    }, 20);
  });

  it("should not receive onTick event after calling stop following pause", (done) => {
    const timer = new RxTimer(50);
    let ticked = false;

    timer.onTick().subscribe(() => (ticked = true));

    timer.start();

    setTimeout(() => {
      timer.pause();
      timer.stop();

      setTimeout(() => {
        expect(ticked).toBe(false);
        done();
      }, 75);
    }, 20);
  });

  it("should receive the first onTick event after 50ms of starting the timer, and the second after another 50ms", (done) => {
    const timer = new RxTimer(50);
    let tickCount = 0;

    timer.onTick().subscribe(() => {
      tickCount++;
    });

    timer.start();

    setTimeout(() => {
      expect(tickCount).toBe(1);

      timer.start();
      setTimeout(() => {
        expect(tickCount).toBe(2);
        done();
      }, 75);
    }, 75);
  });

  it("should receive start event after calling start", (done) => {
    const timer = new RxTimer(50);
    let started = false;
    timer.onStart().subscribe(() => {
      started = true;
    });

    timer.start();

    setTimeout(() => {
      expect(started).toBe(true);
      done();
    }, 75);
  });

  it("should receive pause event after calling pause", (done) => {
    const timer = new RxTimer(50);
    let paused = false;
    timer.onPause().subscribe(() => {
      paused = true;
    });

    timer.start();

    setTimeout(() => {
      timer.pause();

      setTimeout(() => {
        expect(paused).toBe(true);
        done();
      }, 75);
    }, 25);
  });

  it("should receive stop event after calling stop", (done) => {
    const timer = new RxTimer(50);
    let stoped = false;
    timer.onStop().subscribe(() => {
      stoped = true;
    });

    timer.start();

    setTimeout(() => {
      timer.stop();

      setTimeout(() => {
        expect(stoped).toBe(true);
        done();
      }, 75);
    }, 25);
  });

  it("should receive resume event after calling resume with paused", (done) => {
    const timer = new RxTimer(50);
    let resumed = false;
    timer.onResume().subscribe(() => {
      resumed = true;
    });

    timer.start();

    setTimeout(() => {
      timer.pause();

      setTimeout(() => {
        timer.resume();
        setTimeout(() => {
          expect(resumed).toBe(true);
          done();
        }, 50);
      }, 25);
    }, 25);
  });

  it("should emit events in the correct sequence: start, pause, resume, tick", (done) => {
    const timer = new RxTimer(50);
    const eventStack: RxTimerEvent[] = [];
    timer.onEvent().subscribe((e) => {
      eventStack.push(e);
    });

    timer.start();

    setTimeout(() => {
      timer.pause();
      setTimeout(() => {
        timer.resume();
        setTimeout(() => {
          expect(eventStack.join()).toBe(
            [
              RxTimerEvent.START,
              RxTimerEvent.PAUSE,
              RxTimerEvent.RESUME,
              RxTimerEvent.TICK,
            ].join()
          );
          done();
        }, 50);
      }, 25);
    }, 25);
  });

  it("should emit events in the correct sequence: start, stop", (done) => {
    const timer = new RxTimer(50);
    const eventStack: RxTimerEvent[] = [];
    timer.onEvent().subscribe((e) => {
      eventStack.push(e);
    });

    timer.start();

    setTimeout(() => {
      timer.stop();
      setTimeout(() => {
        expect(eventStack.join()).toBe(
          [RxTimerEvent.START, RxTimerEvent.STOP].join()
        );
        done();
      }, 50);
    }, 25);
  });

  it("should emit events in the correct sequence: start, pause, stop", (done) => {
    const timer = new RxTimer(50);
    const eventStack: RxTimerEvent[] = [];
    timer.onEvent().subscribe((e) => {
      eventStack.push(e);
    });

    timer.start();

    setTimeout(() => {
      timer.pause();
      setTimeout(() => {
        timer.stop();
        setTimeout(() => {
          expect(eventStack.join()).toBe(
            [RxTimerEvent.START, RxTimerEvent.PAUSE, RxTimerEvent.STOP].join()
          );
          done();
        }, 50);
      }, 25);
    }, 25);
  });

  it("should not tick after stop and resume", (done) => {
    const timer = new RxTimer(100);

    let ticked = false;

    timer.onTick().subscribe(() => {
      ticked = true;
    });

    timer.start();

    setTimeout(() => {
      timer.stop();

      timer.resume();

      setTimeout(() => {
        expect(ticked).toBe(false);
        done();
      }, 150);
    }, 50);
  });

  it("should start timer at specified time and emit two tick", (done) => {
    const timer = new RxTimer(50, {
      beginTime: new Date().getTime() + 500,
      continue: true,
    });
    let tickCount = 0;

    timer.onTick().subscribe(() => {
      tickCount++;
    });

    timer.start();

    setTimeout(() => {
      timer.stop();
      expect(tickCount).toBe(2);
      done();
    }, 630);
  });

  it("pauses the timer and reduces remaining time appropriately", (done) => {
    const timer = new RxTimer(200);

    timer.start();

    setTimeout(() => {
      timer.pause();
      expect(timer.getRemainingMilliseconds() <= 150).toBe(true);
      done();
    }, 50);
  });

  it("retrieves the remaining time accurately during countdown", (done) => {
    const timer = new RxTimer(200);

    timer.start();

    setTimeout(() => {
      expect(timer.getRemainingMilliseconds() <= 100).toBe(true);
      setTimeout(() => {
        expect(timer.getRemainingMilliseconds() <= 50).toBe(true);
        done();
      }, 50);
    }, 100);
  });

  it("accurately reflects remaining time after pause and resume", (done) => {
    const timer = new RxTimer(200);

    timer.start();

    setTimeout(() => {
      timer.pause();

      expect(timer.getRemainingMilliseconds() <= 100).toBe(true);
      setTimeout(() => {
        timer.resume();
        setTimeout(() => {
          expect(timer.getRemainingMilliseconds() <= 50).toBe(true);
          done();
        }, 50);
      }, 50);
    }, 100);
  });

  describe("testing continue option", () => {
    it("should receive two onTick events after 120ms with continue: true", (done) => {
      const timer = new RxTimer(50, { continue: true });
      let tickCount = 0;

      timer.onTick().subscribe(() => {
        tickCount++;
      });

      timer.start();

      setTimeout(() => {
        timer.stop();

        expect(tickCount).toBe(2);
        done();
      }, 120);
    });
  });

  describe("testing beginTime option", () => {
    it("should start timer at specified time and emit one tick", (done) => {
      const timer = new RxTimer(50, { beginTime: new Date().getTime() + 500 });

      let tickCount = 0;

      timer.onTick().subscribe(() => {
        tickCount++;
      });

      timer.start();

      setTimeout(() => {
        expect(tickCount).toBe(1);
        done();
      }, 570);
    });

    it("should emit START and TICK events after specified time", (done) => {
      const timer = new RxTimer(50, { beginTime: new Date().getTime() + 500 });

      const eventStack: RxTimerEvent[] = [];
      timer.onEvent().subscribe((e) => {
        eventStack.push(e);
      });

      timer.start();

      setTimeout(() => {
        expect(eventStack.join()).toBe(
          [RxTimerEvent.START, RxTimerEvent.TICK].join()
        );
        done();
      }, 570);
    });

    it("should not emit tick event before specified time", (done) => {
      const timer = new RxTimer(50, { beginTime: new Date().getTime() + 500 });

      let tickCount = 0;

      timer.onTick().subscribe(() => {
        tickCount++;
      });

      timer.start();

      setTimeout(() => {
        expect(tickCount).toBe(0);
        done();
      }, 100);
    });

    it("should not emit any events before specified time", (done) => {
      const timer = new RxTimer(50, { beginTime: new Date().getTime() + 500 });

      const eventStack: RxTimerEvent[] = [];
      timer.onEvent().subscribe((e) => {
        eventStack.push(e);
      });

      timer.start();

      setTimeout(() => {
        expect(eventStack.join()).toBe([].join());
        done();
      }, 100);
    });
  });

  describe("testing status", () => {
    it("initializes timer as stopped", () => {
      const timer = new RxTimer(50);

      expect(timer.isCounting()).toBe(false);
      expect(timer.isPaused()).toBe(false);
      expect(timer.isStopped()).toBe(true);
    });

    it("starts the timer and sets it as counting", (done) => {
      const timer = new RxTimer(50);

      timer.start();

      setTimeout(() => {
        expect(timer.isCounting()).toBe(true);
        expect(timer.isPaused()).toBe(false);
        expect(timer.isStopped()).toBe(false);
        done();
      }, 20);
    });

    it("pauses the running timer and sets it as paused", (done) => {
      const timer = new RxTimer(50);

      timer.start();

      setTimeout(() => {
        timer.pause();

        expect(timer.isCounting()).toBe(false);
        expect(timer.isPaused()).toBe(true);
        expect(timer.isStopped()).toBe(false);

        done();
      }, 20);
    });

    it("stops the running timer and sets it as stopped", (done) => {
      const timer = new RxTimer(50);

      timer.start();

      setTimeout(() => {
        timer.stop();

        expect(timer.isCounting()).toBe(false);
        expect(timer.isPaused()).toBe(false);
        expect(timer.isStopped()).toBe(true);

        done();
      }, 20);
    });

    it("completes counting and transitions to the stopped state", (done) => {
      const timer = new RxTimer(50);

      let ticked = false;
      timer.onTick().subscribe(() => {
        ticked = true;
      });

      timer.start();

      setTimeout(() => {
        // finished counting
        expect(ticked).toBe(true);

        expect(timer.isCounting()).toBe(false);
        expect(timer.isPaused()).toBe(false);
        expect(timer.isStopped()).toBe(true);

        done();
      }, 80);
    });

    it("verifies timer state after reaching the begin time", (done) => {
      const timer = new RxTimer(50, { beginTime: new Date().getTime() + 1000 });

      timer.start();

      setTimeout(() => {
        expect(timer.getRemainingMilliseconds()).toBe(0);

        expect(timer.isCounting()).toBe(false);
        expect(timer.isPaused()).toBe(false);
        expect(timer.isStopped()).toBe(true);
        done();
      }, 100);
    });

    it("verifies timer is stopped before starting", () => {
      const timer = new RxTimer(1000);

      expect(timer.isStopped()).toBe(true);

      timer.start();

      expect(timer.isStopped()).toBe(false);
    });

    it("verifies timer is paused after pausing", () => {
      const timer = new RxTimer(1000);

      timer.start();

      expect(timer.isPaused()).toBe(false);

      timer.pause();

      expect(timer.isPaused()).toBe(true);
    });

    it("verifies timer is counting after starting", () => {
      const timer = new RxTimer(1000);

      expect(timer.isCounting()).toBe(false);

      timer.start();

      expect(timer.isCounting()).toBe(true);
    });
  });
});
