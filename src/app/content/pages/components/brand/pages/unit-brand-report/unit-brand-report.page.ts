import { Component, OnInit } from '@angular/core';
import { BrandModel, ReportValue, ReportService, SubheaderService, LanguagePipe, BrandUnitReportType } from '../../../../../../core/core.module';
import { TranslateService } from '@ngx-translate/core';
import { BrandState, BrandReportState } from '../../states';
import { BehaviorSubject } from 'rxjs';
import { Range } from 'ngx-mat-daterange-picker';
import { addDays, startOfMonth } from 'date-fns';

@Component({
    selector: 'm-unit-brand-report',
    templateUrl: './unit-brand-report.page.html',
    styleUrls: ['./unit-brand-report.page.scss']
})
export class UnitBrandReportPage implements OnInit {

    private _obsers: any[] = [];

    private _readyConditions: Map<string, boolean> = new Map([
        ["Brand", false]
    ]);

    lang: string = "vi";

    viewData: any = {
        brand: new BrandModel(),
        unitBoard: Array<ReportValue>(),
        unitServiceBoard: Array<ReportValue>(),
        unitViewsTop: Array<ReportValue>(),
        unitAppointmentTop: Array<ReportValue>(),

        viewChart: Array<ReportValue>(),
        serviceChart: Array<ReportValue>(),
        appointmentChart: Array<ReportValue>(),

        loadingUnitViewsTop$: new BehaviorSubject<boolean>(false),
        loadingUnitAppointmentTop$: new BehaviorSubject<boolean>(false),
        loadingBoard$: new BehaviorSubject<boolean>(false),
        loadingServiceBoard$: new BehaviorSubject<boolean>(false),
        loadingViewChart$: new BehaviorSubject<boolean>(false),
        loadingServiceChart$: new BehaviorSubject<boolean>(false),
        loadingAppointmentChart$: new BehaviorSubject<boolean>(false),

        resetChart: false
    }

    viewControl: any = {
        ready: false,
    }

    constructor(
        public _translate: TranslateService,
        private _reportService: ReportService,
        private _brandReportState: BrandReportState,
        private _brandState: BrandState,
        private _subheaderService: SubheaderService,
    ) { }

    ngOnInit() {
        this.viewData.brand = this._brandState.brand$.getValue();

        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    async onUnitViewTopDateRangeChange(event: Range) {
        this.viewData.loadingUnitViewsTop$.next(true);
        this.viewData.unitViewsTop = await this._reportService.getBrandTopUnit(this.viewData.brand.Id, BrandUnitReportType.BrandUnitViews, event.fromDate, event.toDate, 5);
        this.viewData.loadingUnitViewsTop$.next(false);
    }

    async onUnitAppointmentTopDateRangeChange(event: Range) {
        this.viewData.loadingUnitAppointmentTop$.next(true);
        this.viewData.unitAppointmentTop = await this._reportService.getBrandTopUnit(this.viewData.brand.Id, BrandUnitReportType.BrandUnitAppointmentClicks, event.fromDate, event.toDate, 5);
        this.viewData.loadingUnitAppointmentTop$.next(false);
    }

    async onBoardChange(event: Range) {
        this.viewData.loadingBoard$.next(true);
        this.viewData.unitBoard = await this._reportService.getBrandUnitBoard(this.viewData.brand.Id, event.fromDate, event.toDate);
        this.viewData.loadingBoard$.next(false);
    }

    async onServiceBoardChange(event: Range) {
        this.viewData.loadingServiceBoard$.next(true);
        this.viewData.unitServiceBoard = await this._reportService.getBrandUnitServiceBoard(this.viewData.brand.Id, event.fromDate, event.toDate);
        this.viewData.loadingServiceBoard$.next(false);
    }

    async onViewChartDateRangeChange(event: Range) {
        this.viewData.loadingViewChart$.next(true);
        this.viewData.viewChart = await this._reportService.getBrandUnitReport(this.viewData.brand.Id, BrandUnitReportType.BrandUnitViews, event.fromDate, event.toDate);
        this.viewData.loadingViewChart$.next(false);
    }

    async onServiceChartDateRangeChange(event: Range) {
        this.viewData.loadingServiceChart$.next(true);
        this.viewData.serviceChart = await this._reportService.getBrandUnitReport(this.viewData.brand.Id, BrandUnitReportType.BrandUnitServiceClick, event.fromDate, event.toDate);
        this.viewData.loadingServiceChart$.next(false);
    }

    async onAppointmentChartDateRangeChange(event: Range) {
        this.viewData.loadingAppointmentChart$.next(true);
        this.viewData.appointmentChart = await this._reportService.getBrandUnitReport(this.viewData.brand.Id, BrandUnitReportType.BrandUnitAppointmentClicks, event.fromDate, event.toDate);
        this.viewData.loadingAppointmentChart$.next(false);
    }

    private async init(): Promise<void> {
        if (Array.from(this._readyConditions.values()).filter(x => x === false).length === 0) {
            if (this.viewControl.ready) return;

            this.viewControl.ready = true;
            this.viewData.resetChart = false;
            this.bindBreadcrumbs();

            Promise.all([
                this._reportService.getBrandUnitBoard(this.viewData.brand.Id, addDays(new Date(), -1), new Date()),
                this._reportService.getBrandUnitServiceBoard(this.viewData.brand.Id, addDays(new Date(), -1), new Date()),
                this._reportService.getBrandTopUnit(this.viewData.brand.Id, BrandUnitReportType.BrandUnitViews, startOfMonth(new Date()), new Date(), 5),
                this._reportService.getBrandUnitReport(this.viewData.brand.Id, BrandUnitReportType.BrandUnitViews, addDays(new Date(), -6), new Date()),
                this._reportService.getBrandUnitReport(this.viewData.brand.Id, BrandUnitReportType.BrandUnitServiceClick, addDays(new Date(), -6), new Date()),
                this._reportService.getBrandUnitReport(this.viewData.brand.Id, BrandUnitReportType.BrandUnitAppointmentClicks, addDays(new Date(), -6), new Date()),
                this._reportService.getBrandTopUnit(this.viewData.brand.Id, BrandUnitReportType.BrandUnitAppointmentClicks, startOfMonth(new Date()), new Date(), 5),
            ]).then(value => {
                this.viewData.unitBoard = value[0];
                this.viewData.unitServiceBoard = value[1];
                this.viewData.unitViewsTop = value[2];
                this.viewData.viewChart = value[3];
                this.viewData.serviceChart = value[4];
                this.viewData.appointmentChart = value[5];
                this.viewData.unitAppointmentTop = value[6];
                this.viewData.resetChart = true;
                this._brandReportState.loading$.next(false);
            });
        }
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: new LanguagePipe().transform(this.viewData.brand.Name), page: `/brand` },
            { title: "BRANDS.REPORT", page: `/brand/report` }
        ]);
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this._brandState.brand$.subscribe(value => {
                if (value) {
                    this._brandReportState.loading$.next(true);

                    this.viewData.brand = value;

                    this._readyConditions.set("Brand", true);

                    if (this.viewControl.ready) {
                        this.viewControl.ready = false;
                    }

                    this.init();
                }
            })
        );

        this._obsers.push(
            this._translate.onLangChange.subscribe(() => {
                if (this._readyConditions.get("Brand")) {
                    this.bindBreadcrumbs();
                }
            })
        )
    }

}
