import { Component, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material';

import { BehaviorSubject, merge } from 'rxjs';
import { tap } from 'rxjs/operators';

import { TranslateService } from '@ngx-translate/core';

import {
    NotificationService,
    SubheaderService,
    ConfirmService,
    SystemAlertService,

    NotificationCampaignModel,

    CommonDatasource,
    QueryParamsModel,
} from '../../../../../../core/core.module';

@Component({
    selector: 'rbp-scheduled-notifications-list',
    templateUrl: './scheduled-notifications-list.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScheduledNotificationsListPage implements OnInit {

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

    private _obsers: any[] = [];

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false),
    };

    viewData: any = {
        displayedColumns: ["Index", "Title", "Content", "CreatedAt", "ExecuteAt", "Actions"],
        dataSource: new CommonDatasource(),
        campaigns$: new BehaviorSubject<NotificationCampaignModel[]>([]),
        campaignsStored: new Array<NotificationCampaignModel>(),
    }

    constructor(
        private _subheaderService: SubheaderService,
        private _notificationService: NotificationService,
        private _confirmService: ConfirmService,
        private _systemAlertService: SystemAlertService,
        private _translate: TranslateService,
    ) { }

    ngOnInit(): void {
        this.bindSubscribes();

        this.bindBreadcrumbs();
        this.bindDataSource();
        this.bindEvents();

        this.init();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    refresh(): void {
        this.viewControl.loading$.next(true);

        this._notificationService.getScheduledNotifications().then(res => {
            this.viewData.campaigns$.next(res);
        }).finally(() => this.viewControl.loading$.next(false));
    }

    cancel(model: NotificationCampaignModel): void {
        let dialog = this._confirmService.show(this._translate.instant('COMMON.CONFIRMATION'), this._translate.instant('NOTIFICATIONS.CANCEL_CONFIRM'));

        let sub = dialog.afterClosed().subscribe(async res => {
            if (!res)
                return;

            this.executeCancel(model.Id);
        });

        this._obsers.push(sub);
    }

    private executeCancel(id: string | number): void {
        this.viewControl.loading$.next(true);

        this._notificationService.cancelNotification(id).then(res => {
            if (res) {
                this._systemAlertService.success(this._translate.instant("NOTIFICATIONS.CANCEL_SUCCESSFUL"))

                this.viewControl.loading$.next(false);

                this.refresh();
            }
        }).catch(() => this.viewControl.loading$.next(false));
    }

    private loadCampaigns(): void {
        const queryParams = new QueryParamsModel(
            {},
            'asc',
            '',
            this.paginator.pageIndex,
            this.paginator.pageSize
        );

        this.viewData.dataSource.load(this.viewData.campaignsStored, queryParams);
    }

    private init(): void {
        this.refresh();
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "NOTIFICATIONS.SCHEDULED", page: '/notification/scheduled' }
        ]);
    }

    private bindDataSource(): void {
        const queryParams = new QueryParamsModel({});

        this.viewData.dataSource.init(this.viewData.campaigns$, queryParams);
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this.viewData.campaigns$.subscribe(res => {
                this.viewData.campaignsStored = res;
            })
        );
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
