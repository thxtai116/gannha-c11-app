import { Component, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { MatPaginator, MatDialog } from '@angular/material';

import { BehaviorSubject, merge } from 'rxjs';
import { tap } from 'rxjs/operators';

import {
    JobModel,
    SubmissionModel,

    SubheaderService,

    QueryParamsModel,

    JobSubmissionsDataSource,
} from '../../../../../../core/core.module';

import { SubmissionsDetailComponent } from "../../../../../partials/smarts/submissions/submissions.module";

import { JobsDetailState } from '../../states';

import { MenuService } from '../../services';

@Component({
    selector: 'm-jobs-submissions',
    templateUrl: './jobs-submissions.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobsSubmissionsPage implements OnInit {

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

    private _obsers: any[] = [];

    private _readyConditions: Map<string, boolean> = new Map([
        ["Job", false]
    ]);

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false),
        ready: false
    };

    viewData: any = {
        job: new JobModel(),
        displayedColumns: ["Index", "Name", "Phone", "JobTitle", "UnitAddress", "UpdatedAt", "Status", "Actions"],
    };

    constructor(
        public dataSource: JobSubmissionsDataSource,
        private _jobsDetailState: JobsDetailState,
        private _subheaderService: SubheaderService,
        private _menuService: MenuService,
        public dialog: MatDialog,
    ) { }

    ngOnInit() {
        this.viewControl.loading$ = this.dataSource.loadingSubject;
        this.viewControl.loading$.next(true);

        this.bindEvents();

        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    refresh(): void {
        this.loadSubmissions();
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
        });

        this._obsers.push(sub);
    }

    loadSubmissions(): void {
        const queryParams = new QueryParamsModel(
            {
                id: this.viewData.job.Id
            },
            'asc',
            '',
            this.paginator.pageIndex,
            this.paginator.pageSize
        );

        this.dataSource.load(queryParams);
    }

    private restoreQueryParams(): void {
        if (this.dataSource.queryParams && this.viewData.job.Id === this.dataSource.queryParams.filter['id']) {
            this.paginator.pageIndex = this.dataSource.queryParams.pageNumber;
            this.paginator.pageSize = this.dataSource.queryParams.pageSize;
        }
    }

    private init(): void {
        if (Array.from(this._readyConditions.values()).filter(x => x === false).length === 0) {
            if (this.viewControl.ready)
                return;

            this.viewControl.ready = true;

            this.bindBreadcrumbs();

            this._jobsDetailState.menu$.next(this._menuService.getJobDetailMenu());

            this.viewControl.loading$.next(false);

            this.restoreQueryParams();

            this.loadSubmissions();
        }
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "JOBS.LIST", page: '/jobs' },
            { title: `${this.viewData.job.Title}`, page: `/jobs/${this.viewData.job.Id}` },
            { title: "JOBS.SUBMISSIONS", page: `/jobs/${this.viewData.job.Id}/submissions` }
        ]);
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this._jobsDetailState.job$.subscribe(res => {
                if (res) {
                    this.viewData.job = res;

                    this._readyConditions.set("Job", true);

                    this.init();
                }
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
    }
}
