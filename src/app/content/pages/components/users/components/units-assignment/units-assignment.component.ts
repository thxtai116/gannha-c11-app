import { Component, OnInit, ChangeDetectionStrategy, Input, ViewChild, ElementRef } from '@angular/core';
import { BehaviorSubject, merge, fromEvent } from 'rxjs';

import {
    UserInfoModel,
    QueryParamsModel,
    UnitModel,

    UnitsDataSource,

    UnitOverviewViewModel,
    BrandViewModel,

    TenantService,
    ConfirmService,
    SystemAlertService,
    AssignService,

    UnitTransformer,
} from '../../../../../../core/core.module';

import { MatPaginator, MatSort, MatDialog } from '@angular/material';

import { SelectionModel } from '@angular/cdk/collections';

import { TranslateService } from '@ngx-translate/core';

import { tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { UnitsSelectorComponent } from '../../../../shared/shared.module';
import { SelectionPreviewComponent } from '../../../../shared/components/selection-preview/selection-preview.component';

@Component({
    selector: 'm-units-assignment.component',
    templateUrl: './units-assignment.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnitsAssignmentComponent implements OnInit {
    @Input() user$: BehaviorSubject<UserInfoModel> = new BehaviorSubject<UserInfoModel>(null);

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild('searchInput', { static: true }) searchInput: ElementRef;

    private _obsers: any[] = [];
    private _filter: any = {
        'brand': "",
        'status': "",
        'province': "",
        'text': ""
    }

    private _readyConditions: Map<string, boolean> = new Map([
        ["User", false]
    ]);

    lang: string = "vi";

    viewControl: any = {
        ready: false,
        loading$: new BehaviorSubject<boolean>(false)
    }

    viewFilter: any = {
        filterStatus: "",
        filterBrand: ""
    };

    viewData: any = {
        user: new UserInfoModel(),
        displayedColumns: ["Select", "Index", "Name", "BrandName", "Status", "Actions"],
        dataSource: new UnitsDataSource(),
        selection: new SelectionModel<UnitOverviewViewModel>(true, []),
        brands: new Array<BrandViewModel>(),
        units$: new BehaviorSubject<UnitOverviewViewModel[]>([]),
        unitsResult: new Array<UnitOverviewViewModel>(),
        unitsStored: new Array<UnitOverviewViewModel>()
    }

    constructor(
        private _tenantService: TenantService,
        private _confirmService: ConfirmService,
        private _systemAlertService: SystemAlertService,
        private _assignService: AssignService,
        private _unitTransformer: UnitTransformer,
        private _translate: TranslateService,
        public dialog: MatDialog
    ) {
    }

    ngOnInit() {
        this.viewControl.loading$.next(true);

        if (this.user$.getValue()) {
            this.viewData.user = this.user$.getValue();

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

    loadUnits(): void {
        const queryParams = new QueryParamsModel(
            this.filterConfiguration(),
            this.sort.direction,
            this.sort.active,
            this.paginator.pageIndex,
            this.paginator.pageSize
        );

        this.viewData.dataSource.load(this.viewData.unitsStored, queryParams);
    }

    isAllSelected(): boolean {
        const numSelected = this.viewData.selection.selected.length;
        const numRows = this.viewData.dataSource.paginatorTotalSubject.value;

        return numSelected === numRows;
    }

    masterToggle(): void {
        if (this.isAllSelected()) {
            this.viewData.selection.clear();
        } else {
            this.viewData.dataSource.entityStoredSubject.value.forEach(row => this.viewData.selection.select(row));
        }
    }

    onPreviewSelection(): void {
        let data = {
            selectedItems: this.viewData.selection.selected.map(x => x.Name)
        }

        const dialogRef = this.dialog.open(SelectionPreviewComponent, { data: data, panelClass: ['m-mat-dialog-container__wrapper', 'mat-dialog-container--confirmation'], disableClose: true });

        let sub = dialogRef.afterClosed().subscribe(value => {
            sub.unsubscribe();
        });
    }

    assign(): void {
        const data: any = {
            units: this.viewData.units$.getValue(),
            filter: this._filter
        }

        const dialogRef = this.dialog.open(UnitsSelectorComponent, { data: data, disableClose: true });

        let sub = dialogRef.afterClosed().subscribe(res => {
            this._filter = res.filter;
            if (!res.data || res.data.length === 0) {
                return;
            }

            this.viewControl.loading$.next(true);

            Promise.all([
                this._assignService.assignUserToUnit(this.viewData.user.Id, this.viewData.user.RoleNames[0], res.data)
            ]).then(value => {
                if (value[0]) {
                    this._systemAlertService.success(this._translate.instant('USERS.ASSIGN_SUCCESS'));
                    this.loadResources();
                } else {
                    this.viewControl.loading$.next(false);
                }
            }).catch(() => {
                this.viewControl.loading$.next(false);
            }).finally(() => sub.unsubscribe());
        });
    }

    unassignAll(): void {
        const dialogRef = this._confirmService.show(this._translate.instant('COMMON.CONFIRMATION'), this._translate.instant('USERS.UNASSIGN'));

        let sub = dialogRef.afterClosed().subscribe(res => {
            if (!res) {
                return;
            }

            this.viewControl.loading$.next(true);

            let units = this.viewData.selection.selected.map(x => x.Id);

            Promise.all([
                this._assignService.unassignUserFromUnit(this.viewData.user.Id, this.viewData.user.RoleNames[0], units)
            ]).then(value => {
                if (value[0]) {
                    this._systemAlertService.success(this._translate.instant('USERS.UNASSIGN_SUCCESS'));
                    this.loadResources();
                } else {
                    this.viewControl.loading$.next(false);
                }
            }).catch(() => {
                this.viewControl.loading$.next(false);
            }).finally(() => sub.unsubscribe());
        });
    }

    unassign(id: string): void {
        const dialogRef = this._confirmService.show(this._translate.instant('COMMON.CONFIRMATION'), this._translate.instant('USERS.UNASSIGN'));

        let sub = dialogRef.afterClosed().subscribe(res => {
            if (!res) {
                return;
            }

            this.viewControl.loading$.next(true);

            Promise.all([
                this._assignService.unassignUserFromUnit(this.viewData.user.Id, this.viewData.user.RoleNames[0], [id])
            ]).then(value => {
                if (value[0]) {
                    this._systemAlertService.success(this._translate.instant('USERS.UNASSIGN_SUCCESS'));

                    this.loadResources();
                } else {
                    this.viewControl.loading$.next(false);
                }
            }).catch(() => {
                this.viewControl.loading$.next(false);
            }).finally(() => sub.unsubscribe());
        });
    }

    private filterConfiguration(): any {
        const filter: any = {};

        const searchText: string = this.searchInput.nativeElement.value;

        if (this.viewFilter.filterStatus && this.viewFilter.filterStatus.length > 0) {
            filter.Status = this.viewFilter.filterStatus;
        }

        if (this.viewFilter.filterBrand && this.viewFilter.filterBrand.length > 0) {
            filter.BrandId = this.viewFilter.filterBrand;
        }

        filter.Name = searchText;

        return filter;
    }

    private init(): void {
        if (Array.from(this._readyConditions.values()).filter(x => x === false).length === 0) {
            if (this.viewControl.ready) return;

            this.viewControl.ready = true;

            this.loadResources();

            this.bindDataSource();
            this.bindEvents();
        }
    }

    private loadResources(): void {
        this.viewData.selection.clear();

        Promise.all([
            this._tenantService.getUserById(this.viewData.user.Id, true)
        ]).then(value => {
            if (value[0].Resources.Units) {
                let units = value[0].Resources.Units as Array<UnitModel>;
                let vms = units.map(x => this._unitTransformer.toUnitOverView(x));

                this.viewData.brands = this.getBrands(vms);

                this.viewData.units$.next(vms);
            }

            this.viewControl.loading$.next(false);
        }).catch(() => {
            this.viewControl.loading$.next(false);
        });
    }

    private getBrands(units: UnitOverviewViewModel[]): BrandViewModel[] {
        let brands: any[] = [];

        for (let unit of units) {
            if (brands.filter(x => x.Id === unit.BrandId).length === 0) {
                brands.push({
                    Id: unit.BrandId,
                    Name: unit.BrandName
                });
            }
        }

        return brands;
    }

    private bindDataSource(): void {
        const queryParams = new QueryParamsModel(this.filterConfiguration());

        this.viewData.dataSource.init(this.viewData.units$, queryParams);
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this.user$.subscribe(value => {
                if (value) {
                    this.viewData.user = value;

                    this._readyConditions.set("User", true);

                    this.init();
                }
            })
        );

        this._obsers.push(
            this.viewData.dataSource.entitySubject.subscribe(res => {
                this.viewData.unitsResult = res;
            })
        );

        this._obsers.push(
            this.viewData.units$.subscribe(res => {
                this.viewData.unitsStored = res;
            })
        );
    }

    private bindEvents(): void {
        this._obsers.push(
            merge(this.sort.sortChange, this.paginator.page)
                .pipe(
                    tap(() => {
                        this.loadUnits();
                    })
                )
                .subscribe()
        );

        this._obsers.push(
            fromEvent(this.searchInput.nativeElement, 'keyup')
                .pipe(
                    debounceTime(150),
                    distinctUntilChanged(),
                    tap(() => {
                        this.loadUnits();
                    })
                )
                .subscribe()
        );
    }
}
