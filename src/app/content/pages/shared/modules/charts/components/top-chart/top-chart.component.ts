import { Component, OnInit, Input, ViewChild, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { ReportValue, ChartEntryModel } from '../../../../../../../core/models';
import { BehaviorSubject } from 'rxjs';
import { DatePipe } from '@angular/common';
import { NgxDrpOptions, PresetItem, Range, NgxMatDrpComponent } from 'ngx-mat-daterange-picker';
import { TranslateService } from '@ngx-translate/core';
import { addDays, startOfWeek, endOfWeek, startOfMonth } from 'date-fns';


@Component({
  selector: 'm-top-chart',
  templateUrl: './top-chart.component.html',
  styleUrls: ['./top-chart.component.scss'],
  providers: [DatePipe]
})
export class TopChartComponent implements OnInit {

  private _obsers: any[] = [];
  private _data$ = new BehaviorSubject<ReportValue[]>([]);
  private _reset$ = new BehaviorSubject<boolean>(null);

  @ViewChild('dateRangePicker', { static: true }) dateRangePicker: NgxMatDrpComponent;

  @Input() title: string = "";
  @Input() loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  @Input()
  set data(value) {
    this._data$.next(value);
  };

  get data() {
    return this._data$.getValue();
  }

  @Input()
  set reset(value) {
    this._reset$.next(value);
  };

  get reset() {
    return this._reset$.getValue();
  }

  @Output() onDateRangeChange: EventEmitter<Range> = new EventEmitter<Range>();

  viewData: any = {
    displayedColumns: ["Name", "Total"],
  }

  options: NgxDrpOptions;
  presets: Array<PresetItem> = [];
  cancelChangeDetect: boolean = true;
  dateString: string = "";

  constructor(
    private _translate: TranslateService,
    private datePipe: DatePipe,
  ) { }

  ngOnInit() {
    this.setupDateRange();
    this.bindSubscribes();
  }

  ngOnDestroy(): void {
    for (let obs of this._obsers) {
      obs.unsubscribe();
    }
  }

  async updateRange(range: Range) {
    if (range.fromDate > range.toDate || this.cancelChangeDetect) return;
    this.getDateRangString(range);
    this.onDateRangeChange.emit(range);
  }

  openDateRange(event) {
    this.cancelChangeDetect = false;
    this.dateRangePicker.openCalendar(event);
  }

  private bindSubscribes(): void {
    this._obsers.push(
      this._reset$.subscribe(() => {
        if (this.reset) {
          this.dateString = this._translate.instant("DATE_RANGE.THIS_MONTH");
          this.options.range = { fromDate: startOfMonth(new Date()), toDate: new Date() };
        }
      })
    );
  }

  private setupDateRange() {
    this.setupPresets();
    this.options = {
      presets: this.presets,
      format: 'mediumDate',
      range: { fromDate: new Date(), toDate: new Date() },
      applyLabel: this._translate.instant("COMMON.SELECT"),
      cancelLabel: this._translate.instant("COMMON.CLOSE"),
      calendarOverlayConfig: {
        shouldCloseOnBackdropClick: true,
        hasBackdrop: true,
      },
      placeholder: ""
    };
  }

  private setupPresets() {
    const today = new Date();
    const yesterday = addDays(today, -1);
    const lastWeekStart = startOfWeek(addDays(new Date(), -7), { weekStartsOn: 1 })
    const lastWeekEnd = endOfWeek(addDays(new Date(), -7), { weekStartsOn: 1 })
    const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    const thisMonthStart = startOfMonth(new Date());

    this.presets = [
      { presetLabel: this._translate.instant("DATE_RANGE.YESTERDAY"), range: { fromDate: yesterday, toDate: yesterday } },
      { presetLabel: this._translate.instant("DATE_RANGE.LAST_WEEK"), range: { fromDate: lastWeekStart, toDate: lastWeekEnd } },
      { presetLabel: this._translate.instant("DATE_RANGE.THIS_WEEK"), range: { fromDate: thisWeekStart, toDate: today } },
      { presetLabel: this._translate.instant("DATE_RANGE.LAST_MONTH"), range: { fromDate: lastMonthStart, toDate: lastMonthEnd } },
      { presetLabel: this._translate.instant("DATE_RANGE.THIS_MONTH"), range: { fromDate: thisMonthStart, toDate: today } }
    ]
  }

  private getDateRangString(range: Range) {
    this.dateString = this.datePipe.transform(range.fromDate, 'd/M/yy') + " - " + this.datePipe.transform(range.toDate, 'd/M/yy');
    this.presets.forEach(x => {
      if (x.range.fromDate.getDate() == range.fromDate.getDate() && x.range.toDate.getDate() == range.toDate.getDate()) {
        this.dateString = x.presetLabel;
      } else {
        if (range.fromDate.getDay() == new Date().getDay()
          && range.toDate.getDay() == new Date().getDay()
          && range.fromDate.getMonth() == new Date().getMonth()
          && range.toDate.getMonth() == new Date().getMonth()
          && range.fromDate.getFullYear() == new Date().getFullYear()
          && range.toDate.getFullYear() == new Date().getFullYear()
        )
          this.dateString = this._translate.instant("DATE_RANGE.TODAY");
      }
    });
  }
}
