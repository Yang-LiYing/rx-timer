import { filter, take } from "rxjs/operators";
import { RxTimer, RxTimerEvent } from ".";
describe("RxTimer", () => {
  it("should emit onTick event.", (done) => {
    const timer = new RxTimer(25);
    let ticked = false;

    timer
      .onTick()
      .subscribe(() => (ticked = true));

    timer.start();

    // 等待一段時間（例如 1100 毫秒），確保足夠的時間讓計時器觸發事件
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
      .pipe(filter(e => e === RxTimerEvent.TICK), take(1))
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

    timer.onTick()
      .subscribe(() => (ticked = true));

    timer.start();

    setTimeout(() => {
      timer.stop();
      setTimeout(() => {
        expect(ticked).toBe(false);
        done();
      }, 40);
    }, 20);
  });

  it('should not receive onTick event after calling stop following pause', (done) => {
    const timer = new RxTimer(50);
    let ticked = false;

    timer
      .onTick()
      .subscribe(() => (ticked = true));

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

  it('should receive the first onTick event after 50ms of starting the timer, and the second after another 50ms', (done) => {
    const timer = new RxTimer(50);
    let tickCount = 0;

    timer
      .onTick()
      .subscribe(() => {
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

  it('should receive two onTick events after 125ms with continue: true', (done) => {
    const timer = new RxTimer(50, { continue: true });
    let tickCount = 0;

    timer
      .onTick()
      .subscribe(() => {
        tickCount++;
      });

    timer.start();

    setTimeout(() => {
      timer.stop();

      expect(tickCount).toBe(2);
      done();
    }, 125);
  });

  it('should receive start event after calling start', (done) => {
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

  it('should receive pause event after calling pause', (done) => {
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
      }, 75)
    }, 25);
  });

  it('should receive stop event after calling stop', (done) => {
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

  it('should receive resume event after calling resume with paused', (done) => {
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

  it('should emit events in the correct sequence: start, pause, resume, tick', (done) => {
    const timer = new RxTimer(50);
    const eventStack: RxTimerEvent[] = [];
    timer.onEvent().subscribe(e => {
      eventStack.push(e);
    });

    timer.start();

    setTimeout(() => {
      timer.pause();
      setTimeout(() => {
        timer.resume();
        setTimeout(() => {
          expect(eventStack.join()).toBe([
            RxTimerEvent.START,
            RxTimerEvent.PAUSE,
            RxTimerEvent.RESUME,
            RxTimerEvent.TICK
          ].join());
          done();
        }, 50);
      }, 25);
    }, 25);
  });

  it('should emit events in the correct sequence: start, stop', (done) => {
    const timer = new RxTimer(50);
    const eventStack: RxTimerEvent[] = [];
    timer.onEvent().subscribe(e => {
      eventStack.push(e);
    });

    timer.start();

    setTimeout(() => {
      timer.stop();
      setTimeout(() => {
        expect(eventStack.join()).toBe([
          RxTimerEvent.START,
          RxTimerEvent.STOP,
        ].join());
        done();
      }, 50)
    }, 25);
  });

  it('should emit events in the correct sequence: start, pause, stop', (done) => {
    const timer = new RxTimer(50);
    const eventStack: RxTimerEvent[] = [];
    timer.onEvent().subscribe(e => {
      eventStack.push(e);
    });

    timer.start();

    setTimeout(() => {
      timer.pause();
      setTimeout(() => {
        timer.stop();
        setTimeout(() => {
          expect(eventStack.join()).toBe([
            RxTimerEvent.START,
            RxTimerEvent.PAUSE,
            RxTimerEvent.STOP,
          ].join());
          done();
        }, 50);
      }, 25)
    }, 25);
  });
});
