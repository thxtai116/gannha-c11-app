import { ChangeDetectionStrategy, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';

import { BehaviorSubject, merge, fromEvent } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import {
    BrandModel,
    UserInfoModel,

    QueryParamsModel,
    UnitOverviewViewModel,

    UnitsDataSource,

    SubheaderService,
    FilterStorageService,
    BrandService,

    UnitTransformer,

    GlobalState,

    RoleType,
} from '../../../../../../core/core.module';

import { UnitsState } from '../../states';
import { tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { UnitQuickCreateComponent } from '../../../../shared/shared.module';

@Component({
    selector: 'm-units-list',
    templateUrl: './units-list.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnitsListPage implements OnInit {

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild('searchInput', { static: true }) searchInput: ElementRef;

    private _obsers: any[] = [];
    private _filter: any = {};

    private _readyConditions: Map<string, boolean> = new Map([
        ["User", false],
        ["Brand", false],
        ["Provinces", false]
    ]);

    viewControl: any = {
        ready: false,
        loading$: new BehaviorSubject<boolean>(false),

        allowCreate: false
    };

    viewData: any = {
        brand: new BrandModel(),
        displayedColumns: ["Index", "Name", "Address", "Status", "Actions"],
        dataSource: new UnitsDataSource(),
        units$: new BehaviorSubject<UnitOverviewViewModel[]>([]),
        unitsResult: new Array<UnitOverviewViewModel>(),
        unitsStored: new Array<UnitOverviewViewModel>(),

        provinces$: new BehaviorSubject<any[]>([]),

        userInfo: new UserInfoModel()
    };

    viewFilter: any = {
        filterStatus: "2",
        filterProvince: new FormControl('')
    };

    constructor(
        private _router: Router,
        private _brandService: BrandService,
        private _subheaderService: SubheaderService,
        private _translate: TranslateService,
        private _filterStorageService: FilterStorageService,
        private _unitTransformer: UnitTransformer,
        private _unitsState: UnitsState,
        private _globalState: GlobalState,
        public dialog: MatDialog,
    ) {
    }

    ngOnInit(): void {
        this.viewControl.loading$ = this.viewData.dataSource.loadingSubject;
        this.viewControl.loading$.next(true);

        this.initFilter();

        let brand = this._unitsState.brand$.getValue();

        if (brand) {
            this.viewData.brand = brand;

            this._readyConditions.set("Brand", true);

            if (this.viewControl.ready) {
                this.refresh();
            } else {
                this.init();
            }
        }

        this.bindSubscribes();
    }

    onStatusChange(): void {
        this.saveFilter('status', this.viewFilter.filterStatus);

        this.loadUnits();
    }

    refresh(): void {
        this.viewControl.loading$.next(true);

        Promise.all([
            this._brandService.getUnits(this.viewData.brand.Id)
        ]).then(value => {
            let units = value[0];
            let vms = units.map(value => {
                return this._unitTransformer.toUnitOverView(value);
            });

            this.viewData.units$.next(vms);

            this.loadUnits();
        }).finally(() => {
            this.viewControl.loading$.next(false);
        });
    }

    quickCreate() {
        const dialogRef = this.dialog.open(UnitQuickCreateComponent, { data: this.viewData.brand, disableClose: true });

        let sub = dialogRef.afterClosed().subscribe(res => {
            if (!res)
                return;

            this.refresh();

            sub.unsubscribe();
        });
    }

    showMap(): void {
        this._router.navigate(['/units', 'map-view']);
    }

    private init(): void {
        if (Array.from(this._readyConditions.values()).filter(x => x === false).length === 0) {
            if (this.viewControl.ready) return;

            this.viewControl.ready = true;

            this.bindBreadcrumbs();

            Promise.all([
                this._brandService.getUnits(this.viewData.brand.Id)
            ]).then(value => {
                let units = value[0];
                let vms = units.map(value => {
                    return this._unitTransformer.toUnitOverView(value);
                });

                this.viewData.units$.next(vms);

                this.loadUnits();
            }).finally(() => {
                this.viewControl.loading$.next(false);
            });

            this.bindDataSource();
            this.bindEvents();
        }
    }

    private loadUnits(): void {
        const queryParams = new QueryParamsModel(
            this.filterConfiguration(),
            this.sort.direction,
            this.sort.active,
            this.paginator.pageIndex,
            this.paginator.pageSize
        );

        this.viewData.dataSource.load(this.viewData.unitsStored, queryParams);
    }

    private bindDataSource(): void {
        const queryParams = new QueryParamsModel(this.filterConfiguration());

        this.viewData.dataSource.init(this.viewData.units$, queryParams);
    }

    private filterConfiguration(): any {
        const filter: any = {};

        const searchText: string = this.searchInput.nativeElement.value;

        if (this.viewFilter.filterStatus && this.viewFilter.filterStatus.length > 0) {
            filter.Status = this.viewFilter.filterStatus;
        }

        filter.filterGroup = {
            Name: searchText,
            Address: searchText,
        }

        if (this.viewFilter.filterProvince.value.length > 0) {
            filter.Province = this.viewFilter.filterProvince.value;
        }

        return filter;
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "UNITS.LIST", page: `/units` }
        ]);
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0))
        );

        this._obsers.push(
            this._unitsState.brand$.subscribe(value => {
                if (value) {
                    this.viewData.brand = value;

                    this._readyConditions.set("Brand", true);

                    if (this.viewControl.ready) {
                        this.refresh();
                    } else {
                        this.init();
                    }
                }
            })
        );

        this._obsers.push(
            this._unitsState.provinces$.subscribe(value => {
                if (value && value.length > 0) {

                    this.viewData.provinces$.next(value.map(x => {
                        return {
                            id: x.Id,
                            text: x.Name["vi"]
                        }
                    }));

                    this._readyConditions.set("Provinces", true);

                    if (this.viewControl.ready) {
                        this.refresh();
                    } else {
                        this.init();
                    }
                }
            })
        );

        this._obsers.push(
            this._globalState.userInfoSub$.subscribe(value => {
                if (value) {
                    this.viewData.userInfo = value;

                    this.viewControl.allowCreate = value.RoleNames.indexOf(RoleType.Locator) === -1;

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

        this._obsers.push(
            this.viewFilter.filterProvince.valueChanges.subscribe(value => {
                this.saveFilter("province", value);

                this.loadUnits();
            })
        );

        this._obsers.push(
            this._translate.onLangChange.subscribe(() => {
                this.bindBreadcrumbs();
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

        this._filterStorageService.set(UnitsListPage.name, this._filter);
    }

    private initFilter() {
        this._filter = this._filterStorageService.get(UnitsListPage.name);

        if (this._filter) {
            this.viewFilter.filterStatus = this._filter['status'] || "2";
            this.viewFilter.filterProvince.setValue(this._filter['province'] || "");
            this.searchInput.nativeElement.value = this._filter['text'] || "";
        } else {
            this._filter = {};
        }
    }
}
