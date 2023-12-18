import { Component, OnInit } from '@angular/core';
import { InterviewsState } from './states';
import { GlobalState, BrandModel } from '../../../../core/core.module';

@Component({
  selector: 'm-interviews',
  templateUrl: './interviews.page.html',
})
export class InterviewsPage implements OnInit {
  private _obsers: any[] = [];

  constructor(
    private _globalState: GlobalState,
    private _interviewsState: InterviewsState,
  ) { }

  ngOnInit() {
    this.bindSubscribes();
  }

  ngOnDestroy(): void {
    for (let obs of this._obsers) {
      obs.unsubscribe();
    }
  }

  private bindSubscribes(): void {
    this._obsers.push(
      this._globalState.brand$.subscribe(value => {
        if (value) {
          this._interviewsState.brand$.next(value);
        }
      })
    )
  }

}
