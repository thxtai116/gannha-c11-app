import { Component, OnInit } from '@angular/core';
import { BrandModel, ReportValue, SubheaderService, ReportService, LanguagePipe, BrandSellingPointReportType, BrandUnitReportType } from '../../../../../../core/core.module';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { BrandState, BrandReportState } from '../../states';
import { addDays, startOfMonth } from 'date-fns';
import { Range } from 'ngx-mat-daterange-picker';

@Component({
    selector: 'm-main-brand-report',
    templateUrl: './main-brand-report.page.html',
    styleUrls: ['./main-brand-report.page.scss']
})
export class MainBrandReportPage implements OnInit {

    private _obsers: any[] = [];

    private _readyConditions: Map<string, boolean> = new Map([
        ["Brand", false]
    ]);

    lang: string = "vi";

    viewData: any = {
        brand: new BrandModel(),
        SPBoard: Array<ReportValue>(),
        UnitBoard: Array<ReportValue>(),
        MainBoard: Array<ReportValue>(),
        UnitViewsTop: Array<ReportValue>(),
        SellingPointViewsTop: Array<ReportValue>(),
        SellingPointActionTop: Array<ReportValue>(),

        loadingBoard$: new BehaviorSubject<boolean>(false),
        loadingUnitViewsTop$: new BehaviorSubject<boolean>(false),
        loadingSPViewsTop$: new BehaviorSubject<boolean>(false),
        loadingSPActionTop$: new BehaviorSubject<boolean>(false),

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

    async onBoardChange(event: Range) {
        this.viewData.loadingBoard$.next(true);
        Promise.all([
            this._reportService.getBrandSellingPointReport(this.viewData.brand.Id, BrandSellingPointReportType.BrandSPViews, event.fromDate, event.toDate),
            this._reportService.getBrandSellingPointReport(this.viewData.brand.Id, BrandSellingPointReportType.BrandSPActionApiClicks, event.fromDate, event.toDate),
            this._reportService.getBrandUnitReport(this.viewData.brand.Id, BrandUnitReportType.BrandUnitViews, event.fromDate, event.toDate),
        ]).then(value => {
            this.viewData.SPBoard = [...value[0], ...value[1]];
            this.viewData.UnitBoard = value[2];
            this.viewData.MainBoard = [...this.viewData.SPBoard, ...this.viewData.UnitBoard];
            this.viewData.loadingBoard$.next(false);
        });
    }

    async onUnitViewTopDateRangeChange(event: Range) {
        this.viewData.loadingUnitViewsTop$.next(true);
        this.viewData.UnitViewsTop = await this._reportService.getBrandTopUnit(this.viewData.brand.Id, BrandUnitReportType.BrandUnitViews, event.fromDate, event.toDate, 5);
        this.viewData.loadingUnitViewsTop$.next(false);
    }

    async onSPTopViewDateRangeChange(event: Range) {
        this.viewData.loadingSPViewsTop$.next(true);
        this.viewData.SellingPointViewsTop = await this._reportService.getBrandTopSellingPoint(this.viewData.brand.Id, BrandSellingPointReportType.BrandSPViews, event.fromDate, event.toDate, 5);
        this.viewData.loadingSPViewsTop$.next(false);
    }

    async onSPTopActionDateRangeChange(event: Range) {
        this.viewData.loadingSPActionTop$.next(true);
        this.viewData.SellingPointActionTop = await this._reportService.getBrandTopSellingPoint(this.viewData.brand.Id, BrandSellingPointReportType.BrandSPActionApiClicks, event.fromDate, event.toDate, 5);
        this.viewData.loadingSPActionTop$.next(false);
    }

    private async init(): Promise<void> {
        if (Array.from(this._readyConditions.values()).filter(x => x === false).length === 0) {
            if (this.viewControl.ready) return;

            this.viewControl.ready = true;
            this.viewData.resetChart = false;
            this.bindBreadcrumbs();

            Promise.all([
                this._reportService.getBrandSellingPointReport(this.viewData.brand.Id, BrandSellingPointReportType.BrandSPViews, addDays(new Date(), -1), new Date()),
                this._reportService.getBrandSellingPointReport(this.viewData.brand.Id, BrandSellingPointReportType.BrandSPActionApiClicks, addDays(new Date(), -1), new Date()),
                this._reportService.getBrandUnitReport(this.viewData.brand.Id, BrandUnitReportType.BrandUnitViews, addDays(new Date(), -1), new Date()),
                this._reportService.getBrandTopUnit(this.viewData.brand.Id, BrandUnitReportType.BrandUnitViews, startOfMonth(new Date()), new Date(), 5),
                this._reportService.getBrandTopSellingPoint(this.viewData.brand.Id, BrandSellingPointReportType.BrandSPViews, startOfMonth(new Date()), new Date(), 5),
                this._reportService.getBrandTopSellingPoint(this.viewData.brand.Id, BrandSellingPointReportType.BrandSPActionApiClicks, startOfMonth(new Date()), new Date(), 5)
            ]).then(value => {
                this.viewData.SPBoard = [...value[0], ...value[1]];
                this.viewData.UnitBoard = value[2];
                this.viewData.MainBoard = [...this.viewData.SPBoard, ...this.viewData.UnitBoard];
                this.viewData.UnitViewsTop = value[3];
                this.viewData.SellingPointViewsTop = value[4];
                this.viewData.SellingPointActionTop = value[5];
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
                    this.viewData.brand = value;

                    this._brandReportState.loading$.next(true);

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
        );
    }
}