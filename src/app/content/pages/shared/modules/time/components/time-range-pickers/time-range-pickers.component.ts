import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { SpecificTimingModel } from '../../../../../../../core/models';

@Component({
  selector: 'm-time-range-pickers',
  templateUrl: './time-range-pickers.component.html',
  styleUrls: ['./time-range-pickers.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimeRangePickersComponent implements OnInit {

  @Input() specificTimes: SpecificTimingModel[] = [];
  @Input() readonly: boolean = false;
  @Input() Active: boolean = false;
  @Output() specificTimesChange: EventEmitter<SpecificTimingModel[]> = new EventEmitter<SpecificTimingModel[]>();

  constructor() {

  }

  ngOnInit() {
  }

  onStartTimeChange(event: string, index: number) {
    let specs: SpecificTimingModel[] = JSON.parse(JSON.stringify(this.specificTimes));
    let spec = specs[index];
    if (spec) {
      spec.Open = event;
    }
    this.specificTimesChange.emit(specs);
  }

  onEndTimeChange(event: string, index: number) {
    let specs: SpecificTimingModel[] = JSON.parse(JSON.stringify(this.specificTimes));
    let spec = specs[index];
    if (spec) {
      spec.Close = event;
    }
    this.specificTimesChange.emit(specs);
  }

  add() {
    this.specificTimes.push(new SpecificTimingModel);
    this.specificTimesChange.emit(this.specificTimes);
  }

  delete(index: number) {
    this.specificTimes.splice(index, 1);
    this.specificTimesChange.emit(this.specificTimes);
  }

}
