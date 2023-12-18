import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MatDialog } from '@angular/material';

import {
    UserInfoModel,
    SystemAlertService,
    ConfirmService,
    SubheaderService,
    Status,
    TenantService
} from '../../../../../../core/core.module';

import { UserBasicInfoViewModel } from '../../view-models';

import { TranslateService } from '@ngx-translate/core';

import { MenuService } from '../../services';

import { UsersDetailState } from '../../states';
import { UserRoleDialogComponent } from '../../dialogs/user-role/user-role-dialog.component';

@Component({
    selector: 'm-users-basic-info',
    templateUrl: './users-basic-info.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersBasicInfoPage implements OnInit {

    private _obsers: any[] = [];

    private _readyConditions: Map<string, boolean> = new Map([
        ["User", false]
    ]);

    lang: string = "vi";

    viewControl: any = {
        ready: false,
        loading$: new BehaviorSubject<boolean>(false)
    }

    viewData: any = {
        user: new UserInfoModel()
    }

    viewModel: any = {
        user: new UserBasicInfoViewModel()
    }

    constructor(
        private _usersDetailState: UsersDetailState,
        private _subheaderService: SubheaderService,
        private _menuService: MenuService,
        private _tenantService: TenantService,
        private _translate: TranslateService,
        private _confirmService: ConfirmService,
        private _systemAlertService: SystemAlertService,
        public dialog: MatDialog,
    ) {
    }

    ngOnInit(): void {
        this.viewControl.loading$.next(true);

        this.viewData.user = this._usersDetailState.user$.getValue();

        if (this.viewData.user) {
            this._readyConditions.set("User", true);

            this.init();
        }

        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    changeRole(): void {
        const data: any = {
            user: this.viewData.user
        }

        const dialogRef = this.dialog.open(
            UserRoleDialogComponent,
            {
                data: data,
                disableClose: true,
                panelClass: ['m-mat-dialog-container__wrapper', 'mat-dialog-container--confirmation']
            }
        );

        let sub = dialogRef.afterClosed().subscribe(res => {
            if (!res)
                return;

            if (res.successful)
                this.reload()

            sub.unsubscribe();
        });
    }

    activate(): void {
        const dialogRef = this._confirmService.show(this._translate.instant('COMMON.CONFIRMATION'), this._translate.instant('USERS.ACTIVATE_COMFIRM'));

        let sub = dialogRef.afterClosed().subscribe(res => {
            if (!res) {
                return;
            }

            this.viewControl.loading$.next(true);

            Promise.all([
                this._tenantService.activateUser(this.viewData.user.Id)
            ]).then(value => {
                if (value[0]) {
                    this._systemAlertService.success(this._translate.instant('COMMON.ACTIVATE_SUCCESS'));

                    this.reload();
                } else {
                    this.viewControl.loading$.next(false);
                }
            }).catch(() => {
                this.viewControl.loading$.next(false);
            }).finally(() => sub.unsubscribe());
        });
    }

    deactivate(): void {
        const dialogRef = this._confirmService.show(this._translate.instant('COMMON.CONFIRMATION'), this._translate.instant('USERS.DEACTIVATE_COMFIRM'));

        let sub = dialogRef.afterClosed().subscribe(res => {
            if (!res) {
                return;
            }

            this.viewControl.loading$.next(true);

            Promise.all([
                this._tenantService.deactivateUser(this.viewData.user.Id)
            ]).then(value => {
                if (value[0]) {
                    this._systemAlertService.success(this._translate.instant('COMMON.DEACTIVATE_SUCCESS'));

                    this.reload();
                } else {
                    this.viewControl.loading$.next(false);
                }
            }).catch(() => {
                this.viewControl.loading$.next(false);
            }).finally(() => sub.unsubscribe());
        });
    }

    private reload(): void {
        this.viewControl.loading$.next(true);

        this.viewControl.ready = false;

        Promise.all([
            this._tenantService.getUserById(this.viewData.user.Id)
        ]).then(value => {
            this._usersDetailState.user$.next(value[0]);
        });
    }

    private init(): void {
        if (Array.from(this._readyConditions.values()).filter(x => x === false).length === 0) {
            if (this.viewControl.ready) return;

            this.viewControl.ready = true;

            this.bindBreadcrumbs();

            this._usersDetailState.menu$.next(this._menuService.getUserDetailMenu());

            this.viewModel.user = this.parseToViewModel(this.viewData.user);

            this.viewControl.loading$.next(false);
        }
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "USERS.LIST", page: '/users' },
            { title: this.viewData.user.DisplayName, page: `/users/${this.viewData.user.Id}` },
            { title: "USERS.BASIC_INFO", page: `/users/${this.viewData.user.Id}/basic-info` }
        ]);
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this._usersDetailState.user$.subscribe(value => {
                if (value) {
                    this.viewData.user = value;

                    this._readyConditions.set("User", true);

                    this.init();
                }
            })
        );

        this._obsers.push(
            this._translate.onLangChange.subscribe(() => {
                if (this._readyConditions.get("User")) {
                    this.bindBreadcrumbs();
                }
            })
        );
    }

    private parseToViewModel(user: UserInfoModel): UserBasicInfoViewModel {
        let vm = new UserBasicInfoViewModel();

        vm.Name = user.DisplayName;
        vm.Email = user.Email;
        vm.Phone = user.PhoneNumber;
        vm.Role = user.RoleNames && user.RoleNames.length > 0 ? user.RoleNames[0] : "";
        vm.JoinedDay = new Date(user.JoinDate);
        vm.Status = user.Locked ? Status.Deactive : Status.Active;

        return vm;
    }
}
