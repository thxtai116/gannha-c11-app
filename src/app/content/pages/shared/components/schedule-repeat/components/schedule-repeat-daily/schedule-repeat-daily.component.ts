import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';

@Component({
  selector: 'm-schedule-repeat-daily',
  templateUrl: './schedule-repeat-daily.component.html',
  styleUrls: ['./schedule-repeat-daily.component.scss']
})
export class ScheduleRepeatDailyComponent implements OnInit {

  @Output() onRepeatEveryChange = new EventEmitter<number>();
  
  repeatEvery: number;

  constructor() { }

  ngOnInit() {
  }

  onRepeatEveryInputChange(){
    this.onRepeatEveryChange.emit(this.repeatEvery);
  }
}
