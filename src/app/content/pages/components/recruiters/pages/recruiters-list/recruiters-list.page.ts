import { Component, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material';
import { Router } from '@angular/router';

import { BehaviorSubject, merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

import { RecruitersState } from '../../states';

import {
    RecruitersDataSource,

    SubheaderService,
    SystemAlertService,
    ConfirmService,

    QueryParamsModel,
    RecruiterService,
} from '../../../../../../core/core.module';

@Component({
    selector: 'm-recruiters-list',
    templateUrl: './recruiters-list.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecruitersListPage implements OnInit {
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

    private _obsers: any[] = [];

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false),
        ready: false,
        readyConditions: new Map([
            ["Brand", false]
        ])
    };

    viewData: any = {
        displayedColumns: ["Index", "Title", "Name", "Email", "Phone", "Actions"],
        brand$: new BehaviorSubject<any>({}),
    }

    constructor(
        public dataSource: RecruitersDataSource,
        private _router: Router,
        private _recruitersState: RecruitersState,
        private _recruiterService: RecruiterService,
        private _subheaderService: SubheaderService,
        private _systemAlertService: SystemAlertService,
        private _confirmService: ConfirmService,
        private _translate: TranslateService,
    ) { }

    ngOnInit() {
        this.viewControl.loading$ = this.dataSource.loadingSubject;
        this.viewControl.loading$.next(true);

        this.restoreQueryParams();
        this.bindSubscribes();
        this.bindBreadcrumbs();
        this.bindEvents();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    refresh() {
        this.loadRecruiters();
    }

    loadRecruiters(): void {
        const queryParams = new QueryParamsModel(
            {},
            'asc',
            '',
            this.paginator.pageIndex,
            this.paginator.pageSize
        );

        this.dataSource.load(queryParams);
    }

    create(): void {
        this._router.navigate(["/recruiters", "create"]);
    }

    edit(id: string): void {
        this._router.navigate(["/recruiters", `${id}`]);
    }

    delete(id: string): void {
        const dialogRef = this._confirmService.show(this._translate.instant('COMMON.CONFIRMATION'), this._translate.instant('RECRUITERS.DELETE_CONFIRM'));

        let sub = dialogRef.afterClosed().subscribe(async res => {
            if (!res) {
                return;
            }

            this.viewControl.loading$.next(true);

            let result = await this._recruiterService.delete(id);

            if (result) {
                this._systemAlertService.success(this._translate.instant("RECRUITERS.DELETE_SUCCESSFUL"));
                this.refresh();
            }

            this.viewControl.loading$.next(false);

            sub.unsubscribe();
        });
    }

    private restoreQueryParams(): void {
        if (this.dataSource.queryParams) {
            this.paginator.pageIndex = this.dataSource.queryParams.pageNumber;
            this.paginator.pageSize = this.dataSource.queryParams.pageSize;
        }
    }

    private init(): void {
        if (Array.from(this.viewControl.readyConditions.values()).filter(x => x === false).length === 0) {
            if (this.viewControl.ready) return;

            this.viewControl.ready = true;

            this.viewControl.loading$.next(false);

            this.loadRecruiters();
        }
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "RECRUITERS.LIST", page: '/recruiters' }
        ]);
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this._recruitersState.brand$.subscribe(value => {
                if (value) {
                    this.viewData.brand$.next(value);

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
                        this.loadRecruiters();
                    })
                )
                .subscribe()
        );
    }
}
