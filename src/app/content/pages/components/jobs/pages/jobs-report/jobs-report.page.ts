import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { JobModel, ReportValue, SubheaderService, ReportService, JobReportType } from '../../../../../../core/core.module';

import { JobsDetailState } from '../../states';

import { addDays } from 'date-fns';

import { Range } from 'ngx-mat-daterange-picker';

@Component({
    selector: 'm-jobs-report',
    templateUrl: './jobs-report.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobsReportPage implements OnInit {

    private _obsers: any[] = [];

    private _readyConditions: Map<string, boolean> = new Map([
        ["Job", false]
    ]);

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false),
        ready: false,
        submitting: false,
    };

    viewData: any = {
        job: new JobModel(),
        loadingBoard$: new BehaviorSubject<boolean>(false),
        loadingViewChart$: new BehaviorSubject<boolean>(false),
        loadingSubmitChart$: new BehaviorSubject<boolean>(false),
        loadingResumeChart$: new BehaviorSubject<boolean>(false),
        loadingApplyChart$: new BehaviorSubject<boolean>(false),
        viewChart: Array<ReportValue>(),
        submitChart: Array<ReportValue>(),
        resumeChart: Array<ReportValue>(),
        applyChart: Array<ReportValue>(),
        board: Array<ReportValue>()
    };

    constructor(
        private _jobsDetailState: JobsDetailState,
        private _subheaderService: SubheaderService,
        private _reportService: ReportService,
    ) { }

    ngOnInit() {
        this.viewControl.loading$.next(true);

        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    async onApplyChartDateRangeChange(event: Range) {
        this.viewData.loadingApplyChart$.next(true);
        this.viewData.applyChart = await this._reportService.getJobReport(this.viewData.job.Id, JobReportType.JobApplyClicks, event.fromDate, event.toDate);
        this.viewData.loadingApplyChart$.next(false);
    }

    async onViewChartDateRangeChange(event: Range) {
        this.viewData.loadingViewChart$.next(true);
        this.viewData.viewChart = await this._reportService.getJobReport(this.viewData.job.Id, JobReportType.JobViews, event.fromDate, event.toDate);
        this.viewData.loadingViewChart$.next(false);
    }

    async onResumeChartDateRangeChange(event: Range) {
        this.viewData.loadingResumeChart$.next(true);
        this.viewData.resumeChart = await this._reportService.getJobReport(this.viewData.job.Id, JobReportType.JobResumes, event.fromDate, event.toDate);
        this.viewData.loadingResumeChart$.next(false);
    }

    async onSubmitChartDateRangeChange(event: Range) {
        this.viewData.loadingSubmitChart$.next(true);
        this.viewData.submitChart = await this._reportService.getJobReport(this.viewData.job.Id, JobReportType.JobSubmitClicks, event.fromDate, event.toDate);
        this.viewData.loadingSubmitChart$.next(false);
    }

    async onBoardChange(event: Range) {
        this.viewData.loadingBoard$.next(true);
        this.viewData.board = await this._reportService.getJobBoard(this.viewData.job.Id, event.fromDate, event.toDate);
        this.viewData.loadingBoard$.next(false);
    }

    private init(): void {
        if (Array.from(this._readyConditions.values()).filter(x => x === false).length === 0) {
            if (this.viewControl.ready)
                return;

            this.viewControl.ready = true;

            this.bindBreadcrumbs();

            Promise.all([
                this._reportService.getJobReport(this.viewData.job.Id, JobReportType.JobApplyClicks, addDays(new Date(), -6), new Date()),
                this._reportService.getJobReport(this.viewData.job.Id, JobReportType.JobResumes, addDays(new Date(), -6), new Date()),
                this._reportService.getJobReport(this.viewData.job.Id, JobReportType.JobSubmitClicks, addDays(new Date(), -6), new Date()),
                this._reportService.getJobReport(this.viewData.job.Id, JobReportType.JobViews, addDays(new Date(), -6), new Date()),
                this._reportService.getJobBoard(this.viewData.job.Id, addDays(new Date(), -1), new Date())
            ]).then(value => {
                this.viewData.applyChart = value[0];
                this.viewData.resumeChart = value[1];
                this.viewData.submitChart = value[2];
                this.viewData.viewChart = value[3];
                this.viewData.board = value[4];
            }).finally(() => {
                this.viewControl.loading$.next(false);
            });
        }
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "JOBS.LIST", page: '/jobs' },
            { title: `${this.viewData.job.Title}`, page: `/jobs/${this.viewData.job.Id}` },
            { title: "JOBS.BASIC_INFO", page: `/jobs/${this.viewData.job.Id}/basic-info` }
        ]);
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this._jobsDetailState.job$.subscribe(value => {
                if (value) {
                    this.viewData.job = value;

                    this._readyConditions.set("Job", true);

                    this.init();
                }
            })
        );
    }

}
