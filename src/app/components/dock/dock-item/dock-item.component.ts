import { Component, Input } from '@angular/core';
import { Subject, animationFrameScheduler, combineLatest, concatMap, defer, delay, delayWhen, endWith, exhaustMap, interval, last, map, merge, observeOn, of, range, repeat, scan, skip, take, takeUntil, takeWhile, tap, timer, withLatestFrom } from 'rxjs';

@Component({
  selector: 'app-dock-item',
  templateUrl: './dock-item.component.html',
  styleUrls: ['./dock-item.component.scss']
})
export class DockItemComponent {

  @Input() icon = '';

  startBounce$ = new Subject()

  itemClicked(){
    this.startBounce$.next('')
  }

  // exstensible
  bounce$ = merge(this.startBounce$).pipe(
    exhaustMap(() => this.bouncing$)
  )



  bouncing$ = defer(() => {
    // defer postpones the evaluation of the observable until it get subscribed. This is useful when wanting to evaluate time from the moment the exhaustmap subs to bounces.
    const timeSinceBounceStart = Date.now()
    return interval(0, animationFrameScheduler).pipe(
      // non-deterministic 'temporal set' of frames, in other words as many 'ticks' as your computer can give you when the 'animation frame' is available.
      map(() => Date.now() - timeSinceBounceStart),
      // turn whatever your CPU gives into deterministic 'frames' so that animation value (soon degrees) is temporaly smooth but precise.
      map(t => t / 100),
      // same amount of frames but lower values for each
      // conceptually now best think of rotation in degrees and how a higher degree can be mapped to a longer leg of a triangle
      map(d => d + 4.7),
      // with an arbitrary (trial and error) offset value to assure the starting is at the same point as where the icon is
      map(d => Math.sin(d) + 1),
      // now we are in triangle land (we do + 1 to assure only possitive values) imagine the right leg of a triangle length from 1 to 2 (due to +1) mapped to height
      map(h => h * 16),
      // this represent the height we go out 32 pixel roughly (16 * 2) as the sinus + 1 gives us values between 0 and 2
      scan((p: {h: number, r: number}, ch: number) => {
        return ({h: ch, r: (p.r % 2  == 0) ? ch > p.h ? p.r : p.r + 1 : ch < p.h ? p.r : p.r + 1  })
      }, {h: 0, r: 0}),
      // scan allows us to persist some state during the lifecycle of the observable the r repsents cycles. By looking if values go up (until they don't) and vice versa
      // everytime a value is down or up from its former trend we + 1 and by checking on even oneven we create a nice cycle
      // we can determine when to stop the animation using the takeWhile
      takeWhile(({r}) =>  r < 6),
      // takeWhile completes when a certain value is reached, here we basically say do 3 hops (or 6 ends reached)
      map(({h}) => `${h}px`),
      // final mapping to height of that icon relative to its position
      )
    })
}


// how to visual map degrees to pulsating motion* to get a sense how degrees are mapped to height

//              /|
//             / |
//            /  |
//  75 deg   /___| = 10px

//
//               /
//             / |
//  60 deg   /___| = 5px


