import { Component, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { MatPaginator } from '@angular/material';

import { BehaviorSubject, merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import {
    RecruitmentsDataSource,

    SubheaderService,
    SystemAlertService,

    QueryParamsModel
} from '../../../../../../core/core.module';

import { RecruitmentsState } from '../../states';

import { tap } from 'rxjs/operators';

@Component({
    selector: 'm-recruitments-list',
    templateUrl: './recruitments-list.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecruitmentsListPage implements OnInit {

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
        displayedColumns: ["Index", "Title", "CreatedAt", "Actions"],
        brand$: new BehaviorSubject<any>({}),
    }

    constructor(
        public dataSource: RecruitmentsDataSource,
        private _recruitmentsState: RecruitmentsState,
        private _subheaderService: SubheaderService,
        private _systemAlert: SystemAlertService,
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
        if (this.viewData.brand$.getValue().Id.length > 0) {
            this.loadRecruitments();
        } else {
            this._systemAlert.error(this._translate.instant("COMMON.ERROR.SELECT_BRAND"));
        }
    }

    loadRecruitments(): void {
        const queryParams = new QueryParamsModel(
            {},
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
        if (Array.from(this.viewControl.readyConditions.values()).filter(x => x === false).length === 0) {
            if (this.viewControl.ready) return;

            this.viewControl.ready = true;

            this.viewControl.loading$.next(false);

            this.loadRecruitments();
        }
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "RECRUITMENTS.LIST", page: '/recruitments' }
        ]);
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this._recruitmentsState.brand$.subscribe(value => {
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
                        this.loadRecruitments();
                    })
                )
                .subscribe()
        );
    }
}
