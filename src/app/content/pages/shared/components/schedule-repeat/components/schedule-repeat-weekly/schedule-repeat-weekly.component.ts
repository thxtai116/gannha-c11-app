import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'm-schedule-repeat-weekly',
  templateUrl: './schedule-repeat-weekly.component.html',
  styleUrls: ['./schedule-repeat-weekly.component.scss']
})
export class ScheduleRepeatWeeklyComponent implements OnInit {


  @Output() onRepeatEveryChange = new EventEmitter<number>();
  @Output() onRepeatOnChange = new EventEmitter<number[]>();

  repeatEvery: number;
  On: number[] = [];
  
  constructor() { }

  ngOnInit() {
  }

  onRepeatEveryOnValueChange(event) {
    this.onRepeatOnChange.emit(event);
  }

}
