import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

class DayOfWeekEntity {
  id: number;
  name: string = "";
  selected: boolean = false;

  constructor(id: number, name: string, selected: boolean) {
    this.id = id;
    this.name = name;
    this.selected = selected;
  }
}

@Component({
  selector: 'm-day-of-week',
  templateUrl: './day-of-week.component.html',
  styleUrls: ['./day-of-week.component.scss']
})
export class DayOfWeekComponent implements OnInit {
  private _obsers: any[] = [];

  @Input()
  set days(value) {
    this._days$.next(value);
  };

  get days() {
    return this._days$.getValue();
  }

  @Output("daysChange") daysChange = new EventEmitter<number[]>();

  dayEntities: DayOfWeekEntity[] = [
    new DayOfWeekEntity(0, this._translate.instant('DAYOFWEEK.SUNDAY'), false),
    new DayOfWeekEntity(1, this._translate.instant('DAYOFWEEK.MONDAY'), false),
    new DayOfWeekEntity(2, this._translate.instant('DAYOFWEEK.TUESDAY'), false),
    new DayOfWeekEntity(3, this._translate.instant('DAYOFWEEK.WEDNESDAY'), false),
    new DayOfWeekEntity(4, this._translate.instant('DAYOFWEEK.THURSDAY'), false),
    new DayOfWeekEntity(5, this._translate.instant('DAYOFWEEK.FRIDAY'), false),
    new DayOfWeekEntity(6, this._translate.instant('DAYOFWEEK.SATURDAY'), false)
  ];


  private _days$ = new BehaviorSubject<number[]>([]);

  constructor(
    private _translate: TranslateService,
  ) { }

  ngOnInit() {
    this.bindSubscribes();
  }

  ngOnDestroy(): void {
    for (let obs of this._obsers) {
      obs.unsubscribe();
    }
  }

  onDayChecked(index: number): void {
    this.dayEntities[index].selected = !this.dayEntities[index].selected;

    this.days = this.calculateDays(this.dayEntities);

    this.daysChange.emit(this.days);
  }

  private bindSubscribes(): void {
    this._obsers.push(
      this._days$.subscribe(x => {
        for (var index = 0; index < this.dayEntities.length; index++) {
          let day = this.dayEntities[index];
          day.selected = this.days.indexOf(day.id) !== -1;
        }
      })
    );
  }

  private calculateDays(days: DayOfWeekEntity[]): number[] {
    let selectedDays = new Array<number>();

    for (let index = 0; index < days.length; index++) {
      let day = days[index];

      if (day.selected) {
        selectedDays.push(day.id);
      }
    }

    return selectedDays;
  }

}
