import { take } from "rxjs/operators";
import { RxTimer } from ".";
describe("RxTimer", () => {
  it("should emit onTick event after 1 second", (done) => {
    const timer = new RxTimer(100);
    let ticked = false;

    timer
      .onTick()
      .pipe(take(1))
      .subscribe(() => (ticked = true));

    timer.start();

    // 等待一段時間（例如 1100 毫秒），確保足夠的時間讓計時器觸發事件
    setTimeout(() => {
      expect(ticked).toBe(true);
      done();
    }, 200);
  });

  it("should emit onTick event after 300ms with pause and resume", (done) => {
    const timer = new RxTimer(200);
    let tick = false;

    timer
      .onTick()
      .pipe(take(1))
      .subscribe(() => (tick = true));

    timer.start();

    setTimeout(() => {
      timer.pause();

      setTimeout(() => {
        timer.resume();

        setTimeout(() => {
          expect(tick).toBe(true);
          done();
        }, 200);
      }, 100);
    }, 100);
  });

  it("should not receive onTick event after calling stop", (done) => {
    const timer = new RxTimer(200);
    let ticked = false;

    timer.onTick().subscribe(() => (ticked = true));

    timer.start();

    setTimeout(() => {
      timer.stop();
      setTimeout(() => {
        expect(ticked).toBe(false);
        done();
      }, 200);
    }, 100);
  });

  it('should not receive onTick event after calling stop following pause', (done) => {
    const timer = new RxTimer(200);
    let ticked = false;
  
    timer.onTick().subscribe(() => (ticked = true));
  
    timer.start();
  
    setTimeout(() => {
      timer.pause();
      timer.stop();

      setTimeout(() => {
        expect(ticked).toBe(false);
        done();
      }, 200);
    }, 100);
  });

  it('should receive the first onTick event after 100ms of starting the timer, and the second after another 100ms', (done) => {
    const timer = new RxTimer(100);
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
      }, 200);
    },200);
  });

  it('should receive two onTick events after 250ms with continue: true', (done) => {
    const timer = new RxTimer(100, {continue: true});
    let tickCount = 0;
  
    timer.onTick().subscribe(() => {
      tickCount++;
    });
  
    timer.start();
  
    setTimeout(() => {
      timer.stop();

      expect(tickCount).toBe(2);
      done();
    }, 250);
  });
  
});
