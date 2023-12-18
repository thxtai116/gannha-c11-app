import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, merge, } from 'rxjs';

import {
    SubheaderService,
    NotificationService,

    NotificationCampaignDataSource,

    QueryParamsModel,
} from '../../../../../../core/core.module';

import { MatPaginator } from '@angular/material';
import { tap } from 'rxjs/operators';

@Component({
    selector: 'm-notifications-list',
    templateUrl: './notifications-list.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsListPage implements OnInit {
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

    private _obsers: any[] = [];

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false),
    };

    viewData: any = {
        displayedColumns: ["Index", "Title", "Content", "CreatedAt", "Result"],
        dataSource: new NotificationCampaignDataSource(this._notificationService),
    }

    constructor(
        private _subheaderService: SubheaderService,
        private _notificationService: NotificationService,
    ) {
    }

    ngOnInit(): void {
        this.viewControl.loading$ = this.viewData.dataSource.loadingSubject;

        this.bindBreadcrumbs();
        this.bindEvents();

        this.init();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    private loadCampaigns(): void {
        const queryParams = new QueryParamsModel(
            {},
            'asc',
            '',
            this.paginator.pageIndex,
            this.paginator.pageSize
        );

        this.viewData.dataSource.load(queryParams);
    }

    refresh(): void {
        this.loadCampaigns();
    }

    private init(): void {
        this.loadCampaigns();
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "NOTIFICATIONS.LIST", page: '/notification' }
        ]);
    }

    private bindEvents(): void {
        this._obsers.push(
            merge(this.paginator.page)
                .pipe(
                    tap(() => {
                        this.loadCampaigns();
                    })
                )
                .subscribe()
        );
    }
}
