import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { ShiftModel, SpecificTimingModel } from '../../../../../../../core/core.module';

@Component({
  selector: 'm-shift',
  templateUrl: './shift.component.html',
  styleUrls: ['./shift.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShiftComponent implements OnInit {

  @Input() shift: ShiftModel = new ShiftModel();

  @Output() shiftChange: EventEmitter<ShiftModel> = new EventEmitter<ShiftModel>();

  constructor() {
  }

  ngOnInit() {
  }

  onShiftChange() {
    let shift: ShiftModel = JSON.parse(JSON.stringify(this.shift));
    for (let spec of shift.Specifics) {
      spec.Is24H = shift.AllDay;
    }
    this.shiftChange.emit(shift);
  }

  onSpecificTimesChange(event: SpecificTimingModel[]) {
    // this.shift.Specifics = JSON.parse(JSON.stringify(event));
    // this.shiftChange.emit(this.shift);

    let shift: ShiftModel = JSON.parse(JSON.stringify(this.shift));
    shift.Specifics = JSON.parse(JSON.stringify(event));
    this.shiftChange.emit(shift);
  }
}
