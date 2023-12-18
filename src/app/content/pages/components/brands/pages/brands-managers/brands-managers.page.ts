import { Component, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { MatDialog, MatPaginator, MatSort } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, merge } from 'rxjs';
import { tap } from 'rxjs/operators';

import {
    BrandModel,
    UserInfoModel,
    QueryParamsModel,

    SystemAlertService,
    BrandService,
    SubheaderService,
    AssignService,
    ConfirmService,

    UserInfoOverviewViewModel,

    UsersDataSource,

    UserTransformer,

    RoleType,
    LanguagePipe,
} from '../../../../../../core/core.module';

import { MenuService } from '../../services';
import { BrandsDetailState } from '../../states';
import { SupervisorAssignmentComponent } from '../../components/supervisor-assignment/supervisor-assignment.component';

@Component({
    selector: 'm-brands-managers',
    templateUrl: './brands-managers.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrandsManagersPage implements OnInit {

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    private _obsers: any[] = [];

    private _readyConditions: Map<string, boolean> = new Map([
        ["Brand", false]
    ]);

    lang: string = "vi";

    viewControl: any = {
        ready: false,
        loading$: new BehaviorSubject<boolean>(false)
    }

    viewData: any = {
        displayedColumns: ["Index", "Name", "Email", "Role", "Status", "Actions"],
        dataSource: new UsersDataSource(),
        brand: new BrandModel(),
        users: new Array<UserInfoModel>(),
        users$: new BehaviorSubject<UserInfoOverviewViewModel[]>([]),
        usersResult: new Array<UserInfoOverviewViewModel>(),
        usersStored: new Array<UserInfoOverviewViewModel>()
    }

    constructor(
        private _brandsDetailState: BrandsDetailState,
        private _subheaderService: SubheaderService,
        private _menuService: MenuService,
        private _brandService: BrandService,
        private _assignService: AssignService,
        private _translate: TranslateService,
        private _systemAlertService: SystemAlertService,
        private _confirmService: ConfirmService,
        private _userTransformer: UserTransformer,
        public dialog: MatDialog,
    ) {
    }

    ngOnInit(): void {
        this.viewControl.loading$.next(true);

        this.viewData.brand = this._brandsDetailState.brand$.getValue();

        if (this.viewData.brand.Id.length > 0) {
            this._readyConditions.set("Brand", true);

            this.init();
        }

        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    loadUsers(): void {
        const queryParams = new QueryParamsModel(
            {},
            this.sort.direction,
            this.sort.active,
            this.paginator.pageIndex,
            this.paginator.pageSize
        );

        this.viewData.dataSource.load(this.viewData.usersStored, queryParams);
    }

    assign(): void {
        const dialogRef = this.dialog.open(SupervisorAssignmentComponent, { disableClose: true, width: "500px" });

        let sub = dialogRef.afterClosed().subscribe(res => {
            if (!res || !res.data) {
                return;
            }

            this.viewControl.loading$.next(true);

            Promise.all([
                this._assignService.assignUserToBrand(res.data, RoleType.Supervisor, [this.viewData.brand.Id])
            ]).then(value => {
                if (value[0]) {
                    this._systemAlertService.success(this._translate.instant('USERS.ASSIGN_SUCCESS'));

                    this.refresh();
                }
            }).finally(() => {
                this.viewControl.loading$.next(false);

                sub.unsubscribe();
            });
        });
    }

    unassign(id: string): void {
        let user = this.viewData.users.find(x => x.Id === id) as UserInfoModel;

        if (user) {
            const dialogRef = this._confirmService.show(this._translate.instant('COMMON.CONFIRMATION'), this._translate.instant('USERS.UNASSIGN'));

            let sub = dialogRef.afterClosed().subscribe(res => {
                if (!res) {
                    return;
                }

                this.viewControl.loading$.next(true);

                Promise.all([
                    this._assignService.unassignUserFromBrand(user.Id, RoleType.Supervisor, [this.viewData.brand.Id])
                ]).then(value => {
                    if (value[0]) {
                        this._systemAlertService.success(this._translate.instant('USERS.UNASSIGN_SUCCESS'));

                        this.refresh();
                    }
                }).finally(() => {
                    this.viewControl.loading$.next(false);

                    sub.unsubscribe();
                });
            });
        }
    }

    refresh(): void {
        this.viewControl.loading$.next(true);

        Promise.all([
            this._brandService.getSupervisors(this.viewData.brand.Id)
        ]).then(value => {
            this.viewData.users = value[0];

            this.viewData.users$.next(value[0].map(x => this._userTransformer.toUserInfoOverviewViewModel(x)));
        }).finally(() => {
            this.viewControl.loading$.next(false);
        });
    }

    private init(): void {
        if (Array.from(this._readyConditions.values()).filter(x => x === false).length === 0) {
            if (this.viewControl.ready)
                return;

            this.viewControl.ready = true;

            this.bindBreadcrumbs();
            this.bindDataSource();
            this.bindEvents();

            this._brandsDetailState.menu$.next(this._menuService.getBrandsDetailMenu());

            Promise.all([
                this._brandService.getSupervisors(this.viewData.brand.Id)
            ]).then(value => {
                this.viewData.users = value[0];

                this.viewData.users$.next(value[0].map(x => this._userTransformer.toUserInfoOverviewViewModel(x)));
            }).finally(() => {
                this.viewControl.loading$.next(false);
            });
        }
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "BRANDS.LIST", page: '/brands' },
            { title: new LanguagePipe().transform(this.viewData.brand.Name), page: `/brands/${this.viewData.brand.Id}` },
            { title: "BRANDS.MANAGERS", page: `/brands/${this.viewData.brand.Id}/managers` }
        ]);
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this._brandsDetailState.brand$.subscribe(value => {
                if (value.Id.length > 0) {
                    this.viewData.brand = value;
                    this._readyConditions.set("Brand", true);

                    this.init();
                }
            })
        );

        this._obsers.push(
            this.viewData.dataSource.entitySubject.subscribe(res => {
                this.viewData.usersResult = res;
            })
        );

        this._obsers.push(
            this.viewData.users$.subscribe(res => {
                this.viewData.usersStored = res;
            })
        );

        this._obsers.push(
            this._translate.onLangChange.subscribe(() => {
                if (this._readyConditions.get("Brand")) {
                    this.bindBreadcrumbs();
                }
            })
        );
    }

    private bindEvents(): void {
        this._obsers.push(
            merge(this.sort.sortChange, this.paginator.page)
                .pipe(
                    tap(() => {
                        this.loadUsers();
                    })
                )
                .subscribe()
        );
    }

    private bindDataSource(): void {
        const queryParams = new QueryParamsModel({});

        this.viewData.dataSource.init(this.viewData.users$, queryParams);
    }
}
