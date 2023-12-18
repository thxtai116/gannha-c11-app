import { Component, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { MatPaginator, MatDialog } from '@angular/material';

import { BehaviorSubject, merge } from 'rxjs';
import { tap } from 'rxjs/operators';

import {

    RecruitmentModel,
    QueryParamsModel,

    SubheaderService,

    RecruitmentJobsDataSource,
} from '../../../../../../core/core.module';

import { RecruitmentsDetailState } from '../../states';

import { MenuService } from '../../services';

@Component({
    selector: 'm-jobs-list',
    templateUrl: './jobs-list.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobsListPage implements OnInit {

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

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
        displayedColumns: ["Index", "Title", "StartDate", "EndDate", "Status", "Actions"],
    }

    constructor(
        public dataSource: RecruitmentJobsDataSource,
        private _recruitmentsDetailState: RecruitmentsDetailState,
        private _subheaderService: SubheaderService,
        private _menuService: MenuService,
        public dialog: MatDialog,
    ) { }

    ngOnInit() {
        this.viewControl.loading$ = this.dataSource.loadingSubject;
        this.viewControl.loading$.next(true);

        this.restoreQueryParams();

        this.bindEvents();
        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    refresh(): void {
        this.loadJobs();
    }

    loadJobs(): void {
        const queryParams = new QueryParamsModel(
            {
                id: this.viewData.recruitment.Id
            },
            'asc',
            '',
            this.paginator.pageIndex,
            this.paginator.pageSize
        );

        this.dataSource.load(queryParams);
    }

    private restoreQueryParams(): void {
        if (this.dataSource.queryParams) {
            this.paginator.pageIndex = this.dataSource.queryParams.pageNumber;
            this.paginator.pageSize = this.dataSource.queryParams.pageSize;
        }
    }

    private init(): void {
        if (Array.from(this._readyConditions.values()).filter(x => x === false).length === 0) {
            if (this.viewControl.ready)
                return;

            this.viewControl.ready = true;

            this._recruitmentsDetailState.menu$.next(this._menuService.getRecruitmentDetailMenu());

            this.loadJobs();
            this.bindBreadcrumbs();
        }
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "RECRUITMENTS.LIST", page: '/recruitments' },
            { title: `${this.viewData.recruitment.Title}`, page: `/recruitments/${this.viewData.recruitment.Id}` },
            { title: "RECRUITMENTS.JOBS", page: `/recruitments/${this.viewData.recruitment.Id}/jobs` }
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
