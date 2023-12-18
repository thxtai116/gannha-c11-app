import { Component, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material';

import { BehaviorSubject, merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

import {
    RecruitmentService,
    SubheaderService,

    QueryParamsModel,

    SystemAlertService,

    RecruitmentJobsDataSource
} from '../../../../../../core/core.module';

import { JobsState } from '../../states';

@Component({
    selector: 'm-jobs-list',
    templateUrl: './jobs-list.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobsListPage implements OnInit {

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

    private _obsers: any[] = [];

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false),
        ready: false,
        readyConditions: new Map([
            ["Brand", false]
        ])
    };

    viewFilter: any = {
        filterRecruitment: ""
    };

    viewData: any = {
        displayedColumns: ["Index", "Title", "StartDate", "EndDate", "Status", "Actions"],
        brand$: new BehaviorSubject<any>({}),
        recruitments$: new BehaviorSubject<any[]>([]),
    }

    constructor(
        public dataSource: RecruitmentJobsDataSource,
        private _router: Router,
        private _jobsState: JobsState,
        private _subheaderService: SubheaderService,
        private _recruitmentService: RecruitmentService,
        private _systemAlert: SystemAlertService,
        private _translate: TranslateService,
    ) { }

    ngOnInit() {
        this.viewControl.loading$ = this.dataSource.loadingSubject;
        this.viewControl.loading$.next(true);

        this.restoreQueryParams();

        this.bindBreadcrumbs();
        this.bindEvents();

        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    refresh() {
        if (this.viewData.brand$.getValue().Id.length > 0) {
            this.loadJobs();
        } else {
            this._systemAlert.error(this._translate.instant("COMMON.ERROR.SELECT_BRAND"));
        }
    }

    loadJobs(): void {
        const queryParams = new QueryParamsModel(
            {
                id: this.viewFilter.filterRecruitment
            },
            'asc',
            '',
            this.paginator.pageIndex,
            this.paginator.pageSize
        );

        this.dataSource.load(queryParams);
    }

    create(): void {
        if (this.viewData.brand$.getValue().Id.length > 0) {
            this._router.navigate(["jobs", "create"]);
        } else {
            this._systemAlert.error(this._translate.instant("COMMON.ERROR.SELECT_BRAND"));
        }
    }

    private restoreQueryParams(): void {
        if (this.dataSource.queryParams) {
            this.paginator.pageIndex = this.dataSource.queryParams.pageNumber;
            this.paginator.pageSize = this.dataSource.queryParams.pageSize;

            this.viewFilter.filterRecruitment = this.dataSource.queryParams.filter['id'];
        }
    }

    private init(): void {
        if (Array.from(this.viewControl.readyConditions.values()).filter(x => x === false).length === 0) {
            if (this.viewControl.ready) return;

            this.viewControl.ready = true;

            this._recruitmentService.getAll().then(res => {
                this.viewData.recruitments$.next(res.map(x => {
                    return { id: x.Id, text: x.Title };
                }));

                this.viewControl.loading$.next(false);

                if (this.viewFilter.filterRecruitment.length > 0)
                    this.loadJobs();
            });
        }
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "JOBS.LIST", page: '/jobs' }
        ]);
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this._jobsState.brand$.subscribe(value => {
                if (value) {
                    let brand = this._jobsState.brand$.getValue();

                    this.viewData.brand$.next(brand);

                    this.viewControl.readyConditions.set("Brand", true);

                    this.init();
                }
            })
        )
    }

    private bindEvents(): void {
        this._obsers.push(
            merge(this.paginator.page)
                .pipe(
                    tap(() => {
                        this.loadJobs();
                    })
                )
                .subscribe()
        );
    }
}
