import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import {
    UnitModel,
    SubheaderService,
    LanguagePipe,
    UnitReportType,
    ReportService,
    ReportValue,
} from '../../../../../../core/core.module';
import { UnitsDetailState } from '../../states/units-detail.state';
import { Range } from 'ngx-mat-daterange-picker';
import { addDays } from 'date-fns';

@Component({
    selector: 'm-units-report',
    templateUrl: './units-report.page.html',
    styleUrls: ['./units-report.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnitsReportPage implements OnInit {

    private _obsers: any[] = [];

    private _readyConditions: Map<string, boolean> = new Map([
        ["Unit", false]
    ]);

    reportType = UnitReportType;

    lang: string = "vi";

    viewControl: any = {
        ready: false,
        loading$: new BehaviorSubject<boolean>(false)
    }

    viewData: any = {
        unit: new UnitModel(),
        loadingBoard$: new BehaviorSubject<boolean>(false),
        loadingCallChart$: new BehaviorSubject<boolean>(false),
        loadingShareChart$: new BehaviorSubject<boolean>(false),
        loadingActionChart$: new BehaviorSubject<boolean>(false),
        loadingAppointmentChart$: new BehaviorSubject<boolean>(false),
        actionChart: Array<ReportValue>(),
        appointmentChart: Array<ReportValue>(),
        shareChart: Array<ReportValue>(),
        callChart: Array<ReportValue>(),
        generalChart: Array<ReportValue>(),
        board: Array<ReportValue>()
    }

    constructor(
        private _unitsDetailState: UnitsDetailState,
        private _translate: TranslateService,
        private _reportService: ReportService,
        private _subheaderService: SubheaderService,
    ) { }

    ngOnInit() {
        this.viewControl.loading$.next(true);

        let unit = this._unitsDetailState.unit$.getValue();

        if (unit) {
            this.viewData.unit = unit;

            this._readyConditions.set("Unit", true);

            this.init();
        }

        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    async onCallChartDateRangeChange(event: Range) {
        this.viewData.loadingCallChart$.next(true);
        this.viewData.callChart = await this._reportService.getUnitReport(this.viewData.unit.Id, UnitReportType.UnitCallClicks, event.fromDate, event.toDate);
        this.viewData.loadingCallChart$.next(false);
    }

    async onAppointmentChartDateRangeChange(event: Range) {
        this.viewData.loadingAppointmentChart$.next(true);
        this.viewData.appointmentChart = await this._reportService.getUnitReport(this.viewData.unit.Id, UnitReportType.UnitAppointmentClicks, event.fromDate, event.toDate);
        this.viewData.loadingAppointmentChart$.next(false);
    }

    async onActionChartDateRangeChange(event: Range) {
        this.viewData.loadingActionChart$.next(true);
        this.viewData.actionChart = await this._reportService.getUnitReport(this.viewData.unit.Id, UnitReportType.UnitActionApiClicks, event.fromDate, event.toDate);
        this.viewData.loadingActionChart$.next(false);
    }

    async onShareChartDateRangeChange(event: Range) {
        this.viewData.loadingShareChart$.next(true);
        this.viewData.shareChart = await this._reportService.getUnitReport(this.viewData.unit.Id, UnitReportType.UnitShareClicks, event.fromDate, event.toDate);
        this.viewData.loadingShareChart$.next(false);
    }

    async onBoardChange(event: Range) {
        this.viewData.loadingBoard$.next(true);
        this.viewData.board = await this._reportService.getUnitBoard(this.viewData.unit.Id, event.fromDate, event.toDate);
        this.viewData.loadingBoard$.next(false);
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this._unitsDetailState.unit$.subscribe(value => {
                if (value) {
                    this.viewData.unit = value;

                    this._readyConditions.set("Unit", true);

                    this.init();
                }
            })
        );

        this._obsers.push(
            this._translate.onLangChange.subscribe(() => {
                if (this._readyConditions.get("Unit")) {
                    this.bindBreadcrumbs();
                }
            })
        );
    }

    private async init(): Promise<void> {
        if (Array.from(this._readyConditions.values()).filter(x => x === false).length === 0) {
            if (this.viewControl.ready) return;
            this.viewControl.ready = true;

            this.bindBreadcrumbs();

            Promise.all([
                this._reportService.getUnitReport(this.viewData.unit.Id, UnitReportType.UnitActionApiClicks, addDays(new Date(), -6), new Date()),
                this._reportService.getUnitReport(this.viewData.unit.Id, UnitReportType.UnitAppointmentClicks, addDays(new Date(), -6), new Date()),
                this._reportService.getUnitReport(this.viewData.unit.Id, UnitReportType.UnitCallClicks, addDays(new Date(), -6), new Date()),
                this._reportService.getUnitReport(this.viewData.unit.Id, UnitReportType.UnitShareClicks, addDays(new Date(), -6), new Date()),
                this._reportService.getUnitBoard(this.viewData.unit.Id, addDays(new Date(), -1), new Date())
            ]).then(value => {
                this.viewData.actionChart = value[0];
                this.viewData.appointmentChart = value[1];
                this.viewData.callChart = value[2];
                this.viewData.shareChart = value[3];
                this.viewData.board = value[4];
                this.viewData.generalChart = [...value[0], ...value[1], ...value[2], ...value[3]];
                this.viewControl.loading$.next(false);
            });
        }
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "UNITS.LIST", page: `/units` },
            { title: `${new LanguagePipe().transform(this.viewData.unit.Name)}`, page: `/units/${this.viewData.unit.Id}` },
            { title: "UNITS.BASIC_INFO", page: `/units/${this.viewData.unit.Id}/report` }
        ]);
    }
}
