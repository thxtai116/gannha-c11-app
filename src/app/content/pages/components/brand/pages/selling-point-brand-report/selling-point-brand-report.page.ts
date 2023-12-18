import { Component, OnInit } from '@angular/core';
import { BrandModel, ReportValue, ReportService, SubheaderService, LanguagePipe, BrandSellingPointReportType } from '../../../../../../core/core.module';
import { TranslateService } from '@ngx-translate/core';
import { BrandState, BrandReportState } from '../../states';
import { Range } from 'ngx-mat-daterange-picker';
import { addDays, startOfMonth } from 'date-fns';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'm-selling-point-brand-report',
    templateUrl: './selling-point-brand-report.page.html',
    styleUrls: ['./selling-point-brand-report.page.scss']
})
export class SellingPointBrandReportPage implements OnInit {

    private _obsers: any[] = [];

    private _readyConditions: Map<string, boolean> = new Map([
        ["Brand", false]
    ]);

    lang: string = "vi";

    viewData: any = {
        brand: new BrandModel(),
        sellingPointViewsTop: Array<ReportValue>(),
        sellingPointActionTop: Array<ReportValue>(),

        sellingPointBoard: Array<ReportValue>(),
        sellingPointActionBoard: Array<ReportValue>(),

        actionChart: Array<ReportValue>(),
        appointmentChart: Array<ReportValue>(),
        appointmentShareChart: Array<ReportValue>(),
        newAppointmentChart: Array<ReportValue>(),
        posterViewChart: Array<ReportValue>(),
        viewChart: Array<ReportValue>(),

        loadingSPViewsTop$: new BehaviorSubject<boolean>(false),
        loadingSPActionTop$: new BehaviorSubject<boolean>(false),
        loadingSPBoard$: new BehaviorSubject<boolean>(false),
        loadingSPActionBoard$: new BehaviorSubject<boolean>(false),
        loadingActionChart$: new BehaviorSubject<boolean>(false),
        loadingAppointmentChart$: new BehaviorSubject<boolean>(false),
        loadingAppointmentShareChart$: new BehaviorSubject<boolean>(false),
        loadingNewAppointmentShareChart$: new BehaviorSubject<boolean>(false),
        loadingPosterViewChart$: new BehaviorSubject<boolean>(false),
        loadingViewChart$: new BehaviorSubject<boolean>(false),

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

    async onSPTopViewDateRangeChange(event: Range) {
        this.viewData.loadingSPViewsTop$.next(true);
        this.viewData.sellingPointViewsTop = await this._reportService.getBrandTopSellingPoint(this.viewData.brand.Id, BrandSellingPointReportType.BrandSPViews, event.fromDate, event.toDate, 5);
        this.viewData.loadingSPViewsTop$.next(false);
    }

    async onSPTopActionDateRangeChange(event: Range) {
        this.viewData.loadingSPViewsTop$.next(true);
        this.viewData.sellingPointActionTop = await this._reportService.getBrandTopSellingPoint(this.viewData.brand.Id, BrandSellingPointReportType.BrandSPActionApiClicks, event.fromDate, event.toDate, 5);
        this.viewData.loadingSPViewsTop$.next(false);
    }

    async onBoardChange(event: Range) {
        this.viewData.loadingSPBoard$.next(true);
        this.viewData.sellingPointBoard = await this._reportService.getBrandSellingPointBoard(this.viewData.brand.Id, event.fromDate, event.toDate);
        this.viewData.loadingSPBoard$.next(false);
    }

    async onActionBoardChange(event: Range) {
        this.viewData.loadingSPActionBoard$.next(true);
        this.viewData.sellingPointActionBoard = await this._reportService.getBrandSellingPointActionBoard(this.viewData.brand.Id, event.fromDate, event.toDate);
        this.viewData.loadingSPActionBoard$.next(false);
    }

    async onActionChartDateRangeChange(event: Range) {
        this.viewData.loadingActionChart$.next(true);
        this.viewData.actionChart = await this._reportService.getBrandSellingPointReport(this.viewData.brand.Id, BrandSellingPointReportType.BrandSPActionApiClicks, event.fromDate, event.toDate);
        this.viewData.loadingActionChart$.next(false);
    }

    async onAppointmentChartDateRangeChange(event: Range) {
        this.viewData.loadingAppointmentChart$.next(true);
        this.viewData.appointmentChart = await this._reportService.getBrandSellingPointReport(this.viewData.brand.Id, BrandSellingPointReportType.BrandSPAppointmentClicks, event.fromDate, event.toDate);
        this.viewData.loadingAppointmentChart$.next(false);
    }

    async onAppointmentShareChartDateRangeChange(event: Range) {
        this.viewData.loadingAppointmentShareChart$.next(true);
        this.viewData.appointmentShareChart = await this._reportService.getBrandSellingPointReport(this.viewData.brand.Id, BrandSellingPointReportType.BrandSPAppointmentShares, event.fromDate, event.toDate);
        this.viewData.loadingAppointmentShareChart$.next(false);
    }

    async onNewAppointmentChartDateRangeChange(event: Range) {
        this.viewData.loadingNewAppointmentShareChart$.next(true);
        this.viewData.newAppointmentChart = await this._reportService.getBrandSellingPointReport(this.viewData.brand.Id, BrandSellingPointReportType.BrandSPNewAppointments, event.fromDate, event.toDate);
        this.viewData.loadingNewAppointmentShareChart$.next(false);
    }

    async onPosterViewChartDateRangeChange(event: Range) {
        this.viewData.loadingPosterViewChart$.next(true);
        this.viewData.posterViewChart = await this._reportService.getBrandSellingPointReport(this.viewData.brand.Id, BrandSellingPointReportType.BrandSPPosterViews, event.fromDate, event.toDate);
        this.viewData.loadingPosterViewChart$.next(false);
    }

    async onViewChartDateRangeChange(event: Range) {
        this.viewData.loadingViewChart$.next(true);
        this.viewData.viewChart = await this._reportService.getBrandSellingPointReport(this.viewData.brand.Id, BrandSellingPointReportType.BrandSPViews, event.fromDate, event.toDate);
        this.viewData.loadingViewChart$.next(false);
    }

    private async init(): Promise<void> {
        if (Array.from(this._readyConditions.values()).filter(x => x === false).length === 0) {
            if (this.viewControl.ready) return;

            this.viewControl.ready = true;
            this.viewData.resetChart = false;
            this.bindBreadcrumbs();

            Promise.all([
                this._reportService.getBrandTopSellingPoint(this.viewData.brand.Id, BrandSellingPointReportType.BrandSPViews, startOfMonth(new Date()), new Date(), 5),
                this._reportService.getBrandTopSellingPoint(this.viewData.brand.Id, BrandSellingPointReportType.BrandSPActionApiClicks, startOfMonth(new Date()), new Date(), 5),
                this._reportService.getBrandSellingPointBoard(this.viewData.brand.Id, addDays(new Date(), -1), new Date()),
                this._reportService.getBrandSellingPointReport(this.viewData.brand.Id, BrandSellingPointReportType.BrandSPActionApiClicks, addDays(new Date(), -6), new Date()),
                this._reportService.getBrandSellingPointActionBoard(this.viewData.brand.Id, addDays(new Date(), -1), new Date()),
                this._reportService.getBrandSellingPointReport(this.viewData.brand.Id, BrandSellingPointReportType.BrandSPAppointmentClicks, addDays(new Date(), -6), new Date()),
                this._reportService.getBrandSellingPointReport(this.viewData.brand.Id, BrandSellingPointReportType.BrandSPAppointmentShares, addDays(new Date(), -6), new Date()),
                this._reportService.getBrandSellingPointReport(this.viewData.brand.Id, BrandSellingPointReportType.BrandSPNewAppointments, addDays(new Date(), -6), new Date()),
                this._reportService.getBrandSellingPointReport(this.viewData.brand.Id, BrandSellingPointReportType.BrandSPPosterViews, addDays(new Date(), -6), new Date()),
                this._reportService.getBrandSellingPointReport(this.viewData.brand.Id, BrandSellingPointReportType.BrandSPViews, addDays(new Date(), -6), new Date()),
            ]).then(value => {
                this.viewData.sellingPointViewsTop = value[0];
                this.viewData.sellingPointActionTop = value[1];
                this.viewData.sellingPointBoard = value[2];
                this.viewData.actionChart = value[3];
                this.viewData.sellingPointActionBoard = value[4];
                this.viewData.appointmentChart = value[5];
                this.viewData.appointmentShareChart = value[6];
                this.viewData.newAppointmentChart = value[7];
                this.viewData.posterViewChart = value[8];
                this.viewData.viewChart = value[9];
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
