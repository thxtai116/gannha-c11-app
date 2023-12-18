import { Component, OnInit, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'm-selling-point-time-ranges',
  templateUrl: './selling-point-time-ranges.component.html',
  styleUrls: ['./selling-point-time-ranges.component.scss']
})
export class SellingPointTimeRangesComponent implements OnInit {
  private _obsers: any[] = [];

  @Input() readonly: boolean = true;

  @Input()
  set timeRanges(value) {
    this._timeRanges$.next(value);
  };

  get timeRanges() {
    return this._timeRanges$.getValue();
  }

  private _timeRanges$: BehaviorSubject<any[]> = new BehaviorSubject([]);
  displayedColumnsEdit = ['index', 'time_range', 'action'];
  displayedColumns = ['index', 'time_range'];
  
  constructor() { }

  ngOnInit() {
    this.bindSubscribes();
  }

  ngOnDestroy(): void {
    for (let obs of this._obsers) {
      obs.unsubscribe();
    }
  }

  private bindSubscribes() {
    this._obsers.push(
      this._timeRanges$.subscribe(x => {
        if (x.length > 0) {
          // this.startDate = x[0];
          // this.endDate = x[1];
        }
      })
    );
  }

}
