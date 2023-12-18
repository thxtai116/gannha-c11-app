import { ChangeDetectionStrategy, Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';

import { BehaviorSubject, merge, fromEvent } from 'rxjs';
import { tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import {
    SubheaderService,
    SystemAlertService,
    FilterStorageService,

    RawUnitsDataSource,

    RawUnitOverviewViewModel,
    QueryParamsModel,

    RawUnitTransformer,
    LanguagePipe,
    RawUnitService,

    RawUnitModel,
    ActionStatus,
    VerificationRequestService,
} from '../../../../../../core/core.module';

import { RawUnitsState } from '../../states';

import { RawUnitsDetailComponent } from '../../components/raw-units-detail/raw-units-detail.component';
import { RawUnitsUpdateFormComponent } from '../../components/raw-units-update-form/raw-units-update-form.component';
import { RawUnitsDeleteFormComponent } from '../../components/raw-units-delete-form/raw-units-delete-form.component';
import { RawUnitsMapFormComponent } from '../../components/raw-units-map-form/raw-units-map-form.component';

@Component({
    selector: 'm-raw-units-list',
    templateUrl: './raw-units-list.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RawUnitsListPage implements OnInit {

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild('searchInput', { static: true }) searchInput: ElementRef;

    private _obsers: any[] = [];
    private _filter: any = {};
    private _actionCode: Map<number, string> = new Map<number, string>([
        [0, "MapNewInsert"],
        [1, "MapNewUpdate"],
        [2, "VerifyUpdate"],
        [3, "VerifyDelete"],
        [4, "Solved"],
        [5, "All"]
    ])

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false),
        ready: false,
        readyConditions: new Map([
            ["Brand", false]
        ])
    };

    viewFilter: any = {
        filterStatus: ""
    };

    viewData: any = {
        displayedColumns: ["Index", "Name", "Address", "UpdatedAt", "Status", "ActionCode", "Actions"],
        dataSource: new RawUnitsDataSource(),
        units: new Array<RawUnitModel>(),
        units$: new BehaviorSubject<RawUnitOverviewViewModel[]>([]),
        unitsResult: new Array<RawUnitOverviewViewModel>(),
        unitsStored: new Array<RawUnitOverviewViewModel>(),

        brand: {},
        selectedActionCode: "MapNewInsert",

        Total: null,
        SolvedCount: null,
        MapNewInsertCount: null,
        MapNewUpdateCount: null,
        UpdateCount: null,
        DeleteCount: null,
    }

    constructor(
        private _rawUnitsState: RawUnitsState,
        private _subheaderService: SubheaderService,
        private _systemAlertService: SystemAlertService,
        private _filterStorageService: FilterStorageService,
        private _rawUnitService: RawUnitService,
        private _verificationRequestService: VerificationRequestService,
        private _rawUnitTransformer: RawUnitTransformer,
        private _translate: TranslateService,
        public dialog: MatDialog
    ) { }

    ngOnInit() {
        this.viewControl.loading$ = this.viewData.dataSource.loadingSubject;
        this.viewControl.loading$.next(true);

        this.initFilter();

        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    refresh() {
        this.viewControl.loading$.next(true);

        Promise.all([
            this._rawUnitService.getByActionCode(this.viewData.brand.Id, this.viewData.selectedActionCode),
            this._rawUnitService.getBrandsStatistics([this.viewData.brand.Id])
        ]).then(value => {
            this.viewData.units = value[0];
            this.viewData.units$.next(value[0].map(x => this._rawUnitTransformer.toRawUnitViewModel(x)));
            this._rawUnitsState.brandStatistics$.next(value[1][this.viewData.brand.Id])
        }).finally(() => {
            this.loadUnits();
            this.viewControl.loading$.next(false);
        })
    }

    onTabSelected(event: any) {
        this.viewControl.loading$.next(true);
        this.paginator.pageIndex = 0;
        this.viewData.selectedActionCode = this._actionCode.get(event.index);
        this.refresh();
    }

    onStatusChange(): void {
        this.saveFilter('status', this.viewFilter.filterStatus);

        this.loadUnits();
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

    view(id: string): void {
        let unit = this.viewData.units.find(x => x.Id === id);

        if (unit) {
            this.dialog.open(RawUnitsDetailComponent, { data: unit, disableClose: true });
        }
    }

    update(id: string): void {
        let unit = this.viewData.units.find(x => x.Id === id) as RawUnitModel;

        if (unit) {
            if (unit.ActionStatus == ActionStatus.New) {
                unit.ActionStatus = ActionStatus.Read;
                this._rawUnitService.markIssueAsRead(unit);
            }

            const dialogRef = this.dialog.open(RawUnitsUpdateFormComponent, { data: unit, disableClose: true });

            let sub = dialogRef.afterClosed().subscribe(res => {
                if (!res || !res.data)
                    return;

                this.viewControl.loading$.next(true);

                Promise.all([
                    this._rawUnitService.markAsSolved(unit.BrandId, unit.Id, res.data.Id)
                ]).then(value => {
                    if (value && value[0]) {
                        this._systemAlertService.success(this._translate.instant("RAW_UNITS.UPDATE_SUCCESS"));
                        this.refresh();
                    }
                }).finally(() => {
                    this.viewControl.loading$.next(false);

                    sub.unsubscribe();
                })
            })
        }
    }

    delete(id: string): void {
        let unit = this.viewData.units.find(x => x.Id === id) as RawUnitModel;

        if (unit) {
            if (unit.ActionStatus == ActionStatus.New) {
                unit.ActionStatus = ActionStatus.Read;
                this._rawUnitService.markIssueAsRead(unit);
            }

            const dialogRef = this.dialog.open(RawUnitsDeleteFormComponent, { data: unit, disableClose: true });

            let sub = dialogRef.afterClosed().subscribe(async res => {
                if (!res || !res.data)
                    return;

                this.viewControl.loading$.next(true);

                let result: any = {};
                result.deleteTask = await this._rawUnitService.markAsDeleted(unit.BrandId, unit.Id);
                result.solveTask = await this._rawUnitService.markAsSolved(unit.BrandId, unit.Id, unit.ReferenceId);

                if (result && result.deleteTask && result.solveTask) {
                    this._systemAlertService.success(this._translate.instant("RAW_UNITS.DELETE_SUCCESS"));
                    this.refresh();

                    this.viewControl.loading$.next(false);
                }

                sub.unsubscribe();
            })
        }
    }

    map(id: string): void {
        let unit = this.viewData.units.find(x => x.Id === id) as RawUnitModel;

        if (unit) {
            if (unit.ActionStatus == ActionStatus.New) {
                unit.ActionStatus = ActionStatus.Read;
                this._rawUnitService.markRawUnitAsRead(unit)
            }

            const dialogRef = this.dialog.open(RawUnitsMapFormComponent, { data: unit, disableClose: true });

            let sub = dialogRef.afterClosed().subscribe(res => {
                if (!res || !res.data)
                    return;

                this.viewControl.loading$.next(true);

                Promise.all([
                    this._rawUnitService.markAsSolved(unit.BrandId, unit.Id, res.data.Id)
                ]).then(value => {
                    if (value && value[0]) {
                        this._systemAlertService.success(this._translate.instant("RAW_UNITS.IDENTIFY_SUCCESS"));
                        this.refresh();
                    }
                }).finally(() => {
                    this.viewControl.loading$.next(false);

                    sub.unsubscribe();
                });
            });
        }
    }

    private init(): void {
        this.bindDataSource();
        this.bindEvents();

        if (Array.from(this.viewControl.readyConditions.values()).filter(x => x === false).length === 0) {
            if (this.viewControl.ready) return;

            this.viewControl.ready = true;

            this.bindBreadcrumbs();

            this.viewControl.loading$.next(false);

            this.refresh();
        }
    }

    private filterConfiguration(): any {
        const filter: any = {};

        const searchText: string = this.searchInput.nativeElement.value;

        if (this.viewFilter.filterStatus && this.viewFilter.filterStatus.length > 0) {
            filter.ActionStatus = this.viewFilter.filterStatus;
        }

        filter.filterGroup = {
            Name: searchText,
            Address: searchText,
        }

        return filter;
    }

    private bindDataSource(): void {
        const queryParams = new QueryParamsModel(this.filterConfiguration());

        this.viewData.dataSource.init(this.viewData.units$, queryParams);
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "RAW_UNITS.MERCHANTS_LIST", page: '/merchant-unit' },
            { title: new LanguagePipe().transform(this.viewData.brand.Name), page: `/merchant-unit/${this.viewData.brand.Id}` },
            { title: "RAW_UNITS.LIST", page: `/merchant-unit/${this.viewData.brand.Id}/raw-units` }
        ]);
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0))
        );

        this._obsers.push(
            this._rawUnitsState.brandStatistics$.subscribe(res => {
                if (res) {
                    this.viewData.Total = res.Total || null;
                    this.viewData.SolvedCount = res.SolvedCount || null;
                    this.viewData.MapNewInsertCount = res.MapNewInsertCount || null;
                    this.viewData.MapNewUpdateCount = res.MapNewUpdateCount || null;
                    this.viewData.UpdateCount = res.UpdateCount || null;
                    this.viewData.DeleteCount = res.DeleteCount || null;
                } else {
                    this.viewData.Total = null;
                    this.viewData.SolvedCount = null;
                    this.viewData.MapNewInsertCount = null;
                    this.viewData.MapNewUpdateCount = null;
                    this.viewData.UpdateCount = null;
                    this.viewData.DeleteCount = null;
                }
            })
        );

        this._obsers.push(
            this._rawUnitsState.brand$.subscribe(value => {
                if (value && value.Id && value.Id.length > 0) {
                    this.viewData.brand = value;

                    this.viewControl.readyConditions.set("Brand", true);

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
                        this.saveFilter('text', this.searchInput.nativeElement.value);
                        this.loadUnits();
                    })
                )
                .subscribe()
        );
    }

    private saveFilter(key: string, value: any) {
        this._filter[key] = value;

        this._filterStorageService.set(RawUnitsListPage.name, this._filter);
    }

    private initFilter() {
        this._filter = this._filterStorageService.get(RawUnitsListPage.name);

        if (this._filter) {
            this.viewFilter.filterStatus = this._filter['status'] || "";
            this.searchInput.nativeElement.value = this._filter['text'] || "";
        } else {
            this._filter = {};
        }
    }
}
