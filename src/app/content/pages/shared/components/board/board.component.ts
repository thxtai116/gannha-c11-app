import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, Injectable, ViewChild } from '@angular/core';
import { addDays, startOfMonth, startOfWeek, endOfWeek, endOfDay, endOfMonth } from 'date-fns';
import { BehaviorSubject } from 'rxjs';
import { ReportValue } from '../../../../../core/core.module';
import { TranslateService } from '@ngx-translate/core';
import { NgxDrpOptions, PresetItem, Range, NgxMatDrpComponent } from 'ngx-mat-daterange-picker';
import { DatePipe } from '@angular/common';

@Injectable()
export class Board {
    Title: string = "";
    Value: number = 0;
    Compare: number = 0;
}

@Component({
    selector: 'm-board',
    templateUrl: './board.component.html',
    styleUrls: ['./board.component.scss'],
    providers: [DatePipe],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardComponent implements OnInit {

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

    dateString: string = "";
    boards: Board[] = [];
    date = new Date();
    options: NgxDrpOptions;
    presets: Array<PresetItem> = [];
    cancelChangeDetect: boolean = true;
    showCompare: boolean = true;
    hint: string = null;

    constructor(
        private _translate: TranslateService,
        private datePipe: DatePipe
    ) {
    }

    ngOnInit() {
        this.setupDateRange();
        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    openDateRange(event) {
        this.cancelChangeDetect = false;
        this.dateRangePicker.openCalendar(event);
    }

    async updateRange(range: Range) {
        if (this.cancelChangeDetect) return;

        this.getDateRangString(range);

        this.showCompare = true;

        if (this.dateString == this._translate.instant("DATE_RANGE.TODAY")) {
            range.fromDate = addDays(new Date(), -1);
            this.hint = "So sánh với ngày hôm qua" + " (" + this.datePipe.transform(addDays(new Date(), -1), 'd/M/yyyy') + ")";
        } else if (this.dateString == this._translate.instant("DATE_RANGE.THIS_WEEK")) {
            range.fromDate = startOfWeek(addDays(range.fromDate, -1), { weekStartsOn: 1 });
            this.hint = "So sánh với tuần trước" + " ("
                + this.datePipe.transform(range.fromDate, 'd/M/yyyy')
                + " - "
                + this.datePipe.transform(addDays(range.fromDate, 7), 'd/M/yyyy')
                + ")";
        } else if (this.dateString == this._translate.instant("DATE_RANGE.THIS_MONTH")) {
            range.fromDate = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
            this.hint = "So sánh với tháng trước" + " ("
                + this.datePipe.transform(range.fromDate, 'd/M/yyyy')
                + " - "
                + this.datePipe.transform(endOfMonth(range.fromDate), 'd/M/yyyy')
                + ")";
        }else {
            this.showCompare = false;
        }

        this.onDateRangeChange.emit(range);
    }

    private getDateRangString(range: Range) {
        this.dateString = this.datePipe.transform(range.fromDate, 'd/M/yyyy') + " - " + this.datePipe.transform(range.toDate, 'd/M/yyyy');

        if (range.fromDate == range.toDate) {
            this.dateString = this._translate.instant("DATE_RANGE.TODAY");
            return;
        }

        this.presets.forEach(x => {
            if (this.compareDate(x.range.fromDate, range.fromDate) && this.compareDate(x.range.toDate, range.toDate)) {
                this.dateString = x.presetLabel;
            }
        });
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
        this.getDateRangString(this.options.range);
    }

    private setupPresets() {
        const today = new Date();
        const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
        const thisMonthStart = startOfMonth(new Date());

        this.presets = [
            { presetLabel: this._translate.instant("DATE_RANGE.TODAY"), range: { fromDate: today, toDate: today } },
            { presetLabel: this._translate.instant("DATE_RANGE.THIS_WEEK"), range: { fromDate: thisWeekStart, toDate: today } },
            { presetLabel: this._translate.instant("DATE_RANGE.THIS_MONTH"), range: { fromDate: thisMonthStart, toDate: today } }
        ]
    }

    private getBoard(data: ReportValue[]) {
        this.boards = [];
        var types = data.map(x => x.ReportType).filter((el, i, a) => i === a.indexOf(el));

        types.forEach(x => {
            var values = data.filter(y => y.ReportType == x);
            if (values && values.length > 0) {
                var board = new Board();
                board.Title = this._translate.instant("REPORT." + x);
                if (this.dateString == this._translate.instant("DATE_RANGE.TODAY")) {
                    values.forEach(z => {
                        var date = new Date(z.Date);
                        if (date.getDay() == addDays(new Date(), -1).getDay()) {
                            board.Compare += z.Total;
                        } else {
                            board.Value += z.Total;
                        }
                    });
                } else if (this.dateString == this._translate.instant("DATE_RANGE.THIS_WEEK")) {
                    var lastWeekEnd = endOfWeek(addDays(new Date(), -7), { weekStartsOn: 1 });

                    values.forEach(z => {
                        var date = new Date(z.Date);
                        if (date <= lastWeekEnd) {
                            board.Compare += z.Total;
                        } else {
                            board.Value += z.Total;
                        }
                    });

                } else if (this.dateString == this._translate.instant("DATE_RANGE.THIS_MONTH")) {
                    var lastMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth(), 0);

                    values.forEach(z => {
                        var date = new Date(z.Date);
                        if (date <= lastMonthEnd) {
                            board.Compare += z.Total;
                        } else {
                            board.Value += z.Total;
                        }
                    });
                } else {
                    values.forEach(z => board.Value += z.Total);
                }

                this.boards.push(board);
            }
        });

        this.boards = [...this.boards];
        if (!this.hint)
            this.hint = "So sánh với ngày hôm qua" + " (" + this.datePipe.transform(addDays(new Date(), -1), 'd/M/yyyy') + ")";
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this._data$.subscribe(() => {
                if (this.data && this.data.length > 0) {
                    this.getBoard(this.data);
                }
            })
        );

        this._obsers.push(
            this._reset$.subscribe(() => {
                if (this.reset) {
                    this.dateString = this._translate.instant("DATE_RANGE.TODAY");
                    this.options.range = { fromDate: new Date(), toDate: new Date() };
                }
            })
        );
    }

    private compareDate(date1: Date, date2: Date): boolean {
        if (date1.getDate() == date2.getDate() && date1.getMonth() == date2.getMonth() && date1.getFullYear() == date2.getFullYear())
            return true;
        return false;
    }
}
