import { Component, OnInit, Input, ViewChild, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { ReportValue, ChartEntryModel } from '../../../../../../../core/models';
import { BehaviorSubject } from 'rxjs';
import { DatePipe } from '@angular/common';
import { NgxDrpOptions, PresetItem, Range, NgxMatDrpComponent } from 'ngx-mat-daterange-picker';
import { TranslateService } from '@ngx-translate/core';
import { addDays } from 'date-fns';

@Component({
  selector: 'm-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss'],
  providers: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LineChartComponent implements OnInit {

  private _obsers: any[] = [];
  private _data$ = new BehaviorSubject<ReportValue[]>([]);

  @ViewChild('dateRangePicker', { static: true }) dateRangePicker: NgxMatDrpComponent;

  @Input() title: string = "";
  @Input() colors: string[] = [];
  @Input() loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  @Input()
  set data(value) {
    this._data$.next(value);
  };

  get data() {
    return this._data$.getValue();
  }

  @Output() onDateRangeChange: EventEmitter<Range> = new EventEmitter<Range>();

  // options
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = false;
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
  showHeadTool: boolean = true;
  colorScheme = {
    domain: []
  };

  cancelChangeDetect: boolean = true;
  multi: ChartEntryModel[] = [];

  range: Range = { fromDate: new Date(), toDate: new Date() };

  options: NgxDrpOptions;
  presets: Array<PresetItem> = [];

  constructor(
    private datePipe: DatePipe,
    private _translate: TranslateService) { }

  ngOnInit() {
    this.setupDateRange();
    this.bindSubscribes();
  }

  openDateRange(event) {
    this.cancelChangeDetect = false;
    this.dateRangePicker.openCalendar(event);
  }

  ngOnDestroy(): void {
    for (let obs of this._obsers) {
      obs.unsubscribe();
    }
  }

  async updateRange(range: Range) {
    if (range.fromDate == range.toDate || range.fromDate > range.toDate || this.cancelChangeDetect) return;
    this.onDateRangeChange.emit(range);
  }

  private initChart(data: ReportValue[]) {
    this.multi = [];
    var types = data.map(x => x.ReportType).filter((el, i, a) => i === a.indexOf(el));

    this.getDateRange(data.filter(x => x.ReportType == types[0]));

    types.forEach(x => {
      var item = new ChartEntryModel();
      item.name = this._translate.instant("REPORT." + x);
      data.filter(y => y.ReportType == x).forEach(y => {
        item.series.push({ name: this.datePipe.transform(y.Date, 'dd/MM'), value: y.Total })
      });

      this.multi.push(item);
      this.multi = [...this.multi];
    });
    this.colorScheme.domain = this.colors;
    if (this.multi.length > 1) {
      this.showLegend = true;
      this.showHeadTool = false;
    }
  }

  private getDateRange(data: ReportValue[]) {
    this.range = { fromDate: data[0].Date, toDate: data[data.length - 1].Date };
    this.options.range = this.range;
  }

  private setupDateRange() {
    this.setupPresets();
    this.options = {
      presets: this.presets,
      format: 'mediumDate',
      range: this.range,
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
    const minus7 = addDays(today, -6);
    const minus30 = addDays(today, -29);
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    this.presets = [
      { presetLabel: this._translate.instant("DATE_RANGE.LAST_SEVEN_DAYS"), range: { fromDate: minus7, toDate: today } },
      { presetLabel: this._translate.instant("DATE_RANGE.LAST_THIRTY_DAYS"), range: { fromDate: minus30, toDate: today } },
      { presetLabel: this._translate.instant("DATE_RANGE.LAST_MONTH"), range: { fromDate: lastMonthStart, toDate: lastMonthEnd } }
    ]
  }

  private bindSubscribes(): void {
    this._obsers.push(
      this._data$.subscribe(() => {
        if (this.data && this.data.length > 0) {
          this.initChart(this.data);
        }
      })
    );
  }
}
