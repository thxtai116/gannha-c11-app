import { Component, OnInit, Input, Inject, ChangeDetectionStrategy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SellingPointModel, ChartEntryModel } from '../../../../../core/models';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ScheduleEveryType } from '../../../../../core/consts';
import { addDays, differenceInDays, endOfDay, differenceInCalendarDays, addHours, endOfWeek, startOfWeek, compareAsc, differenceInCalendarWeeks, lastDayOfWeek, getDay } from 'date-fns';
import { DatePipe } from '@angular/common';
import { SellingPointOverviewViewModel } from '../../../../../core/view-models';

@Component({
  selector: 'm-selling-point-timeline',
  templateUrl: './selling-point-timeline.component.html',
  styleUrls: ['./selling-point-timeline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe],
})
export class SellingPointTimelineComponent implements OnInit {
  private _obsers: any[] = [];
  private _sellingPoints$: BehaviorSubject<SellingPointModel[]> = new BehaviorSubject([]);


  @Input()
  set sellingPoints(value) {
    this._sellingPoints$.next(value);
  };

  get sellingPoints() {
    return this._sellingPoints$.getValue();
  }

  lang = "vi";
  view: any[] = [3500, 500];
  showXAxis = true;
  showYAxis = false;
  gradient = false;
  showLegend = true;
  showXAxisLabel = false;
  xAxisLabel = 'Date';
  showYAxisLabel = false;
  showGridLines = false;
  yAxisLabel = 'Value';
  timeline = false;
  autoScale = false;
  roundDomains = false;
  showRefLines = true;
  showRefLabels = true;
  legendTitle = "Chú thích"
  colorScheme = {
    domain: []
  };

  multi: ChartEntryModel[] = [];

  constructor(
    public dialogRef: MatDialogRef<SellingPointTimelineComponent>,
    private datePipe: DatePipe,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    this.setSizeChart();
    this.init(this.data);
  }

  ngOnDestroy(): void {
    for (let obs of this._obsers) {
      obs.unsubscribe();
    }
  }

  private setSizeChart() {
    let count = this.getDateRangeCount(this.data)
    if (count < 50) {
      this.view = [3000, 400];
    } else if (count < 100) {
      this.view = [4000, 400];
    } else {
      this.view = [5000, 400];
    }
  }

  private init(data: SellingPointOverviewViewModel[]) {

    let value = 1;

    data.forEach(x => {
      this.colorScheme.domain.push(this.getRandomColor());

      if (x.Repeat.EveryType == ScheduleEveryType.Daily) {
        var item = new ChartEntryModel();
        item.name = x.Title;

        let dates = this.getDateList(addHours(x.StartDate, 7), addHours(x.EndDate, 7));

        if (dates.length > 0) {
          for (let i = 0; i < dates.length; i += 1) {
            item.series.push({ name: this.datePipe.transform(dates[i], 'dd/MM/yy'), value: value })
          }
        }
        this.multi.push(item);
      }
      else if (x.Repeat.EveryType == ScheduleEveryType.Weekly) {
        let weeks = this.getWeekList(addHours(x.StartDate, 7), addHours(x.EndDate, 7));
        if (weeks.length > 0) {
          for (let i = 0; i < weeks.length; i += 1) {

            var item = new ChartEntryModel();
            item.name = x.Title;

            for (let j = 0; j < weeks[i].length; j++) {
              if (x.Repeat.On.includes(getDay(weeks[i][j])))
                item.series.push({ name: this.datePipe.transform(weeks[i][j], 'dd/MM/yy'), value: value });
            }

            this.multi.push(item);
          }
        }
      }
      ++value;
    });
    this.multi = [...this.multi];
  }

  private getDateList(startDate: Date, endDate: Date): Date[] {
    let dates: Date[] = [];
    let count = differenceInCalendarDays(endOfDay(endDate), startDate) + 1;
    for (let i = 0; i < count; i++) {
      dates.push(addDays(startDate, i));
    }
    return dates;
  }

  private getWeekList(startDate: Date, endDate: Date): Array<Date[]> {
    let data: Array<Date[]> = [];

    let start = new Date(startDate);

    let count = differenceInCalendarWeeks(endOfDay(addHours(endDate, 7)), addHours(startDate, 7)) + 1;

    for (let i = 0; i < count; i++) {
      let end = lastDayOfWeek(start, { weekStartsOn: 1 })

      if (i == count - 1) {
        end = endDate;
      }

      let dates = this.getDateList(start, end);
      data.push(dates);
      start = startOfWeek(addDays(end, 1), { weekStartsOn: 1 });
    }

    return data;
  }

  private getDateRangeCount(data: SellingPointOverviewViewModel[]) {
    let startDate = data[0].StartDate;
    let endDate = data[0].EndDate;

    for (let i = 1; i < data.length; i++) {
      if (startDate > data[i].StartDate)
        startDate = data[i].StartDate;

      if (endDate < data[i].EndDate)
        endDate = data[i].EndDate;
    }
    return differenceInCalendarDays(endDate, startDate) + 1;
  }

  onClose() {
    this.dialogRef.close();
  }

  getRandomColor() {
    var length = 6;
    var chars = '0123456789ABCDEF';
    var hex = '#';
    while (length--) hex += chars[(Math.random() * 16) | 0];
    return hex;
  }
}
