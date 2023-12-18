import { Component, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { MatPaginator, MatDialog } from '@angular/material';
import { FormGroup, FormControl } from '@angular/forms';

import { BehaviorSubject, merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

import {
    RecruitmentModel,
    SubmissionModel,
    JobModel,
    UnitModel,

    QueryParamsModel,

    SubheaderService,
    ExcelService,
    RecruitmentService,

    RecruitmentSubmissionsDataSource,

    LanguagePipe,

    SubmissionStatus,

    CommonUtility,
} from '../../../../../../core/core.module';

import { RecruitmentsDetailState } from '../../states';

import { MenuService } from '../../services';

import { SubmissionsDetailComponent } from '../../../../../partials/smarts/submissions/submissions.module';

@Component({
    selector: 'm-submissions-list',
    templateUrl: './submissions-list.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubmissionsListPage implements OnInit {

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

    private _obsers: any[] = [];

    private _readyConditions: Map<string, boolean> = new Map([
        ["Recruitment", false],
        ["Units", false]
    ]);

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false),
        ready: false
    };

    viewData: any = {
        jobs$: new BehaviorSubject<any[]>([]),
        units$: new BehaviorSubject<any[]>([]),
        recruitment: new RecruitmentModel(),
        displayedColumns: ["Index", "Name", "Phone", "JobTitle", "UnitAddress", "UpdatedAt", "Status", "Actions"],
    };

    form: FormGroup;

    submissionStatus: any = this._commonUtil.parseEnumToList(SubmissionStatus);

    constructor(
        public dataSource: RecruitmentSubmissionsDataSource,
        public dialog: MatDialog,
        private _recruitmentsDetailState: RecruitmentsDetailState,
        private _recruitmentService: RecruitmentService,
        private _subheaderService: SubheaderService,
        private _menuService: MenuService,
        private _excelService: ExcelService,
        private _translate: TranslateService,
        private _commonUtil: CommonUtility
    ) {
        this.form = this.generateForm();
    }

    ngOnInit() {
        this.viewControl.loading$ = this.dataSource.loadingSubject;
        this.viewControl.loading$.next(true);

        this.bindSubscribes();
        this.bindEvents();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    refresh(): void {
        this.loadSubmissions();
    }

    loadSubmissions(): void {
        const queryParams = new QueryParamsModel(
            this.parseForm(),
            'asc',
            '',
            this.paginator.pageIndex,
            this.paginator.pageSize
        );

        this.dataSource.load(queryParams);
    }

    detail(model: SubmissionModel): void {
        const dialog = this.dialog.open(SubmissionsDetailComponent, {
            data: {
                id: model.Id,
                job: model.JobId
            },
            width: "70%", 
            disableClose: true
        });

        let sub = dialog.afterClosed().subscribe(res => {
            if (res)
                this.loadSubmissions();

            sub.unsubscribe();
        });
    }

    export(): void {
        alert("Exporting !");
        // let data = this.viewData.submissions$.getValue().map(x => {
        //     return {
        //         Id: x.Id,
        //         FullName: x.FullName,
        //         Email: x.Email,
        //         Phone: x.Phone,
        //         Gender: new GenderNamePipe().transform(x.Gender),
        //         JobTitle: x.JobTitle,
        //         UnitAddress: x.UnitAddress,
        //         CreatedAt: new DatePipe("en").transform(x.CreatedAt, "dd MMM, yyyy hh:mm:ss")
        //     }
        // });

        // this._excelService.exportAsExcelFile(data, "data");
    }

    private restoreQueryParams(): void {
        if (this.dataSource.queryParams && this.viewData.recruitment.Id === this.dataSource.queryParams.filter['id']) {
            this.paginator.pageIndex = this.dataSource.queryParams.pageNumber;
            this.paginator.pageSize = this.dataSource.queryParams.pageSize;

            let unit = this.dataSource.queryParams.filter['unit'];

            if (unit)
                this.ctrlUnit.setValue(unit, { emitEvent: false });

            let job = this.dataSource.queryParams.filter['job'];

            if (job)
                this.ctrlJob.setValue(job.toString(), { emitEvent: false });

            let statuses = this.dataSource.queryParams.filter['statuses'];

            if (statuses)
                this.ctrlStatuses.setValue(statuses, { emitEvent: false });
        }
    }

    private init(): void {
        if (Array.from(this._readyConditions.values()).filter(x => x === false).length === 0) {
            if (this.viewControl.ready)
                return;

            this.viewControl.ready = true;

            this.bindBreadcrumbs();

            this._recruitmentsDetailState.menu$.next(this._menuService.getRecruitmentDetailMenu());

            this._recruitmentService.getJobs(this.viewData.recruitment.Id).then(res => {
                this.viewData.jobs$.next(this.parseJobs(res));

                this.restoreQueryParams();

                this.loadSubmissions();
            });
        }
    }

    private parseJobs(jobs: JobModel[]): any[] {
        let vms: any[] = [{
            id: "",
            text: this._translate.instant("COMMON.ALL")
        }];

        vms.push(...jobs.map(x => {
            return {
                id: x.Id.toString(),
                text: x.Title
            }
        }));

        return vms
    }

    private parseUnits(units: UnitModel[]): any[] {
        let vms: any[] = [{
            id: "",
            text: this._translate.instant("COMMON.ALL")
        }];

        vms.push(...units.map(x => {
            return {
                id: x.Id,
                text: new LanguagePipe().transform(x.Name)
            }
        }));

        return vms;
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "RECRUITMENTS.LIST", page: '/recruitments' },
            { title: `${this.viewData.recruitment.Title}`, page: `/recruitments/${this.viewData.recruitment.Id}` },
            { title: "RECRUITMENTS.SUBMISSIONS", page: `/recruitments/${this.viewData.recruitment.Id}/submissions` }
        ]);
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this._recruitmentsDetailState.recruitment$.subscribe(res => {
                if (res) {
                    this.viewData.recruitment = res;

                    this._readyConditions.set("Recruitment", true);

                    this.init();
                }
            })
        );

        this._obsers.push(
            this._recruitmentsDetailState.units$.subscribe(res => {
                if (res) {
                    this.viewData.units$.next(this.parseUnits(res));

                    this._readyConditions.set("Units", true);

                    this.init();
                }
            })
        );

        this._obsers.push(
            this.form.valueChanges.subscribe(() => {
                this.loadSubmissions();
            })
        );
    }

    private parseForm(): any {
        let filter: any = {
            id: this.viewData.recruitment.Id,
            unit: this.ctrlUnit.value,
            job: this.ctrlJob.value,
            statuses: this.ctrlStatuses.value
        };

        return filter;
    }

    private bindEvents(): void {
        this._obsers.push(
            merge(this.paginator.page)
                .pipe(
                    tap(() => {
                        this.loadSubmissions();
                    })
                )
                .subscribe()
        );
    }

    private generateForm(): FormGroup {
        return new FormGroup({
            Unit: new FormControl(""),
            Job: new FormControl(""),
            Statuses: new FormControl([])
        })
    }

    //#region Form

    get ctrlUnit() { return this.form.get("Unit"); }

    get ctrlJob() { return this.form.get("Job"); }

    get ctrlStatuses() { return this.form.get("Statuses"); }

    //#endregion
}
