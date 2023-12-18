import { Component, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { MatPaginator, MatDialog } from '@angular/material';
import { FormGroup, FormControl } from '@angular/forms';

import { TranslateService } from '@ngx-translate/core';

import { BehaviorSubject, merge } from 'rxjs';
import { tap, } from 'rxjs/operators';

import {
    SubmissionViewModel,
    JobModel,
    UnitModel,
    BrandModel,
    QueryParamsModel,

    SubheaderService,
    RecruitmentService,
    BrandService,

    RecruitmentSubmissionsDataSource,

    SubmissionStatus,

    CommonUtility,

    LanguagePipe,
    SubmissionModel,
} from '../../../../../../core/core.module';

import { ResumesState } from '../../states';

import { SubmissionsDetailComponent } from '../../../../../partials/smarts/submissions/submissions.module';

@Component({
    selector: 'm-resumes-list',
    templateUrl: './resumes-list.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResumesListPage implements OnInit {
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

    private _obsers: any[] = [];

    private _readyConditions: Map<string, boolean> = new Map([
        ["Brand", false],
    ]);

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false),
        ready: false
    };

    viewData: any = {
        brand: new BrandModel(),

        displayedColumns: ["Index", "Name", "Phone", "JobTitle", "UnitAddress", "UpdatedAt", "Status", "Actions"],

        jobs$: new BehaviorSubject<any[]>([]),
        units$: new BehaviorSubject<any[]>([]),
        recruitments$: new BehaviorSubject<any[]>([]),
    };

    form: FormGroup;

    submissionStatus: any = this._commonUtil.parseEnumToList(SubmissionStatus);

    constructor(
        public dataSource: RecruitmentSubmissionsDataSource,
        private _resumesState: ResumesState,
        private _recruitmentService: RecruitmentService,
        private _brandService: BrandService,
        private _subheaderService: SubheaderService,
        private _translate: TranslateService,
        private _dialog: MatDialog,
        private _commonUtil: CommonUtility
    ) {
        this.form = this.generateForm();
    }

    ngOnInit() {
        this.viewControl.loading$ = this.dataSource.loadingSubject;
        this.viewControl.loading$.next(true);

        this.bindBreadcrumbs();
        this.bindSubscribes();
        this.bindEvents();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
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
        const dialog = this._dialog.open(SubmissionsDetailComponent, {
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

    exportDetail(vm: SubmissionViewModel): void {
        // let submission = this.viewData.originSubmissions.find(x => x.Id === vm.Id);

        // this._pdfService.exportResume(submission);
    }

    export(): void {
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

    refresh(): void {
        this.loadSubmissions();
    }

    private init() {
        if (Array.from(this._readyConditions.values()).filter(x => x === false).length === 0) {

            if (this.viewControl.ready)
                return;

            this.viewControl.ready = true;

            this._recruitmentService.getAll().then(res => {
                let vms = res.map(x => {
                    return {
                        id: x.Id.toString(),
                        text: x.Title
                    }
                });

                this.restoreQueryParams();

                this.viewData.recruitments$.next(vms);

                this.loadUnits().then(() => this.loadSubmissions());
            });
        }
    }

    private loadUnits(): Promise<any> {
        this.viewControl.loading$.next(true);

        let chain = Promise.all([
            this._brandService.getUnits(this.viewData.brand.Id),
        ]).then(res => {
            this.viewData.units$.next(this.parseUnits(res[0]));

            this.viewControl.loading$.next(false)

            return new Promise((resolve, reject) => {
                resolve();
            });
        }).catch(() => {
            return new Promise((resolve, reject) => {
                reject();
            });
        });

        return chain;
    }

    private restoreQueryParams(): void {
        if (this.dataSource.queryParams) {
            this.paginator.pageIndex = this.dataSource.queryParams.pageNumber;
            this.paginator.pageSize = this.dataSource.queryParams.pageSize;

            let rec = this.dataSource.queryParams.filter['id'];

            if (rec)
                this.ctrlRecruitment.setValue(rec, { emitEvent: false });

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

    private loadJobs(campaign: string | number): Promise<any> {
        let chain = this._recruitmentService.getJobs(campaign).then(res => {
            this.viewData.jobs$.next(this.parseJobs(res));

            return new Promise((resolve, reject) => {
                resolve();
            });
        }).catch(() => {
            return new Promise((resolve, reject) => {
                reject();
            });
        });

        return chain;
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

    private bindBreadcrumbs() {
        this._subheaderService.setBreadcrumbs([
            { title: "RESUMES.LIST", page: '/resumes' },
        ]);
    }

    private bindSubscribes() {
        this._obsers.push(
            this._resumesState.brand$.subscribe(value => {
                if (value) {
                    this.viewData.brand = value;

                    this._readyConditions.set("Brand", true);

                    this.init();
                }
            })
        );

        this._obsers.push(
            this.ctrlRecruitment.valueChanges.subscribe(() => {
                this.loadJobs(this.ctrlRecruitment.value).then(() => {
                    this.clearForm();

                    this.loadSubmissions();
                })
            })
        );
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

        this._obsers.push(
            merge(this.ctrlUnit.valueChanges, this.ctrlJob.valueChanges, this.ctrlStatuses.valueChanges).subscribe(() => {
                    this.loadSubmissions();
            })
        );
    }

    private generateForm(): FormGroup {
        return new FormGroup({
            Recruitment: new FormControl(""),
            Unit: new FormControl(""),
            Job: new FormControl(""),
            Statuses: new FormControl([])
        })
    }

    private parseForm(): any {
        let filter: any = {
            id: this.ctrlRecruitment.value,
            unit: this.ctrlUnit.value,
            job: this.ctrlJob.value,
            statuses: this.ctrlStatuses.value
        };

        return filter;
    }

    private clearForm(): any {
        this.ctrlJob.setValue("", { emitEvent: false });
    }

    //#region Form

    get ctrlRecruitment() { return this.form.get("Recruitment"); }

    get ctrlUnit() { return this.form.get("Unit"); }

    get ctrlJob() { return this.form.get("Job"); }

    get ctrlStatuses() { return this.form.get("Statuses"); }

    //#endregion
}
