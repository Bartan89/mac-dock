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

  bounce$ = merge(this.startBounce$).pipe(
    concatMap(() => this.bouncing$)
  )



  bouncing$ = defer(() => {
    const timeSinceBounceStart = Date.now()
    return interval(0, animationFrameScheduler).pipe(
      // non-deterministic frames, in other words as many 'ticks' as your computer can give you on the 'animation frame'
      map(() => Date.now() - timeSinceBounceStart),
      tap(x => console.log('x', x)),
      // turn whatever your cocmputer gives into deterministic 'frames' so that animation travel similar distance over time on all CPU speeds
      map(t => t / 100),
      // same amount of frames but lower values for each
      // conceptually now best think of rotation in degrees and how a higher degree can be mapped to a longer leg of a triangle
      map(d => d + 4.7),
      tap(x => console.log('a', x, 'and', Date.now() - timeSinceBounceStart)),
      // with a offset value to assure the starting is at the same point as where the icon is
      map(d => Math.sin(d) + 1),
      // now we are in triangle land (we do + 1 to assure only possitive values) imagine the right leg of a triangles length mapped to height
      map(h => h * 16),
      // this represent the height we go out 32 pixel roughly (16 * 2)
      scan((p: {h: number, r: number}, ch: number) => {
        return ({h: ch, r: (p.r % 2  == 0) ? ch > p.h ? p.r : p.r + 1 : ch < p.h ? p.r : p.r + 1  })
      }, {h: 0, r: 0}),
      // scan allows us to persist some state during the lifecycle of the observable the r repsents cycles. By looking if values go up (until they don't) and vice versa
      // we can determine when to stop the animation using the takeWhile
      takeWhile(({r}) =>  r < 6),
      // takeWhile completes when a certain value is reached, here we basically say do 2 hops
      map(({h}) => `${h}px`),
      // final mapping to height of that icon relative to its position
      )
    })
}


// how to visual map degrees to pulsating motion

//              /|
//             / |
//            /  |
//  60 deg   /___| = 10px

//
//               /
//             / |
//  30 deg   /___| = 5px


