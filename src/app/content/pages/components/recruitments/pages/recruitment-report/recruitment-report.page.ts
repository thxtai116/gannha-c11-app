import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { RecruitmentModel, ReportValue } from '../../../../../../core/models';
import { RecruitmentsDetailState } from '../../states';
import { SubheaderService, ReportService } from '../../../../../../core/services';
import { RecruitmentReportType } from '../../../../../../core/consts';
import { Range } from 'ngx-mat-daterange-picker';
import { addDays } from 'date-fns';

@Component({
  selector: 'm-recruitment-report',
  templateUrl: './recruitment-report.page.html',
  styleUrls: ['./recruitment-report.page.scss']
})
export class RecruitmentReportPage implements OnInit {
  private _obsers: any[] = [];

  private _readyConditions: Map<string, boolean> = new Map([
    ["Recruitment", false]
  ]);

  viewControl: any = {
    loading$: new BehaviorSubject<boolean>(false),
    ready: false
  };

  viewData: any = {
    recruitment: new RecruitmentModel(),
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
    private _recruitmentsDetailState: RecruitmentsDetailState,
    private _subheaderService: SubheaderService,
    private _reportService: ReportService,
  ) { }

  ngOnInit() {
    this.viewControl.loading$.next(true);

    if (this._recruitmentsDetailState.recruitment$.getValue()) {
      this.viewData.recruitment = this._recruitmentsDetailState.recruitment$.getValue();

      this._readyConditions.set("Recruitment", true);

      this.init();
    }

    this.bindSubscribes();
  }

  ngOnDestroy(): void {
    for (let obs of this._obsers) {
      obs.unsubscribe();
    }
  }

  async onApplyChartDateRangeChange(event: Range) {
    this.viewData.loadingApplyChart$.next(true);
    this.viewData.applyChart = await this._reportService.getRecruitmentReport(this.viewData.recruitment.Id, RecruitmentReportType.JobApplyClicks, event.fromDate, event.toDate);
    this.viewData.loadingApplyChart$.next(false);
  }

  async onViewChartDateRangeChange(event: Range) {
    this.viewData.loadingViewChart$.next(true);
    this.viewData.viewChart = await this._reportService.getRecruitmentReport(this.viewData.recruitment.Id, RecruitmentReportType.JobViews, event.fromDate, event.toDate);
    this.viewData.loadingViewChart$.next(false);
  }

  async onResumeChartDateRangeChange(event: Range) {
    this.viewData.loadingResumeChart$.next(true);
    this.viewData.resumeChart = await this._reportService.getRecruitmentReport(this.viewData.recruitment.Id, RecruitmentReportType.JobResumes, event.fromDate, event.toDate);
    this.viewData.loadingResumeChart$.next(false);
  }

  async onSubmitChartDateRangeChange(event: Range) {
    this.viewData.loadingSubmitChart$.next(true);
    this.viewData.submitChart = await this._reportService.getRecruitmentReport(this.viewData.recruitment.Id, RecruitmentReportType.JobSubmitClicks, event.fromDate, event.toDate);
    this.viewData.loadingSubmitChart$.next(false);
  }

  async onBoardChange(event: Range) {
    this.viewData.loadingBoard$.next(true);
    this.viewData.board = await this._reportService.getRecruitmentBoard(this.viewData.recruitment.Id, event.fromDate, event.toDate);
    this.viewData.loadingBoard$.next(false);
  }

  private init(): void {
    if (Array.from(this._readyConditions.values()).filter(x => x === false).length === 0) {
      if (this.viewControl.ready)
        return;

      this.viewControl.ready = true;

      this.bindBreadcrumbs();

      Promise.all([
        this._reportService.getRecruitmentReport(this.viewData.recruitment.Id, RecruitmentReportType.JobApplyClicks, addDays(new Date(), -6), new Date()),
        this._reportService.getRecruitmentReport(this.viewData.recruitment.Id, RecruitmentReportType.JobResumes, addDays(new Date(), -6), new Date()),
        this._reportService.getRecruitmentReport(this.viewData.recruitment.Id, RecruitmentReportType.JobSubmitClicks, addDays(new Date(), -6), new Date()),
        this._reportService.getRecruitmentReport(this.viewData.recruitment.Id, RecruitmentReportType.JobViews, addDays(new Date(), -6), new Date()),
        this._reportService.getRecruitmentBoard(this.viewData.recruitment.Id, addDays(new Date(), -1), new Date())
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
      { title: "RECRUITMENTS.LIST", page: '/recruitments' },
      { title: `${this.viewData.recruitment.Title}`, page: `/recruitments/${this.viewData.recruitment.Id}` },
      { title: "RECRUITMENTS.BASIC_INFO", page: `/recruitments/${this.viewData.recruitment.Id}/basic-info` }
    ]);
  }

  private bindSubscribes(): void {
    this._obsers.push(
      this._recruitmentsDetailState.recruitment$.subscribe(value => {
        if (value) {
          this.viewData.recruitment = value;

          this._readyConditions.set("Recruitment", true);

          this.init();
        }
      })
    );
  }
}
