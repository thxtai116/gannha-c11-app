import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { MatSort, MatPaginator } from '@angular/material';
import { Router } from '@angular/router';
import { BehaviorSubject, merge, fromEvent } from 'rxjs';
import { tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { RawUnitsState } from '../../states';

import {
    QueryParamsModel,
    BrandViewModel,
    BrandsDataSource,
    RawUnitService,
    FilterStorageService,
    SubheaderService,
} from '../../../../../../core/core.module';

@Component({
    selector: 'm-verification-requests-list',
    templateUrl: 'verification-requests-list.page.html',
    styleUrls: ['verification-requests-list.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class VerificationRequestsListPage implements OnInit, OnDestroy {

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild('searchInput', { static: true }) searchInput: ElementRef;

    private _obsers: any[] = [];
    private _filter: any = {};

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false),
        ready: false,
        readyConditions: new Map([
            ["Brands", false],
        ])
    }

    viewData: any = {
        displayedColumns: ["Index", "Name", "Mapping", "Update", "Delete", "Actions"],
        dataSource: new BrandsDataSource(),
        brands$: new BehaviorSubject<BrandViewModel[]>([]),
        brandsStatistics: new Map<string, Array<number>>(),

        brandsResult: new Array<BrandViewModel>(),
        brandsStored: new Array<BrandViewModel>(),

        brandIds: [],
    }

    constructor(
        private _router: Router,
        private _rawUnitsState: RawUnitsState,
        private _rawUnitService: RawUnitService,
        private _subheaderService: SubheaderService,
        private _filterStorageService: FilterStorageService,
    ) { }

    ngOnInit(): void {
        this.viewControl.loading$ = this.viewData.dataSource.loadingSubject;
        this.viewControl.loading$.next(true);
        this.initFilter();
        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        this._obsers.forEach(obs => {
            obs.unsubscribe();
        });
    }

    loadBrands(): void {
        const queryParams = new QueryParamsModel(
            this.filterConfiguration(),
            this.sort.direction,
            this.sort.active,
            this.paginator.pageIndex,
            this.paginator.pageSize
        );

        this.viewData.dataSource.load(this.viewData.brandsStored, queryParams);
    }

    refresh() {
        let brandIds = this.viewData.brandsResult.map(x => x.Id);
        this.loadBrandsStatistics(brandIds);
    }

    view(brandId: any) {
        this._router.navigate(["merchant-unit", brandId]);
    }

    private init(): void {
        if (Array.from(this.viewControl.readyConditions.values()).filter(x => x === false).length === 0) {
            if (this.viewControl.ready) return;

            this.viewControl.ready = true;

            this.bindBreadcrumbs();
            this.bindDataSource();
            this.bindEvents();
            this.loadBrands();

            this.viewControl.loading$.next(false);
        }
    }

    private loadBrandsStatistics(brandIds: Array<string>) {
        if (brandIds && brandIds.length > 0) {
            this.viewControl.loading$.next(true);
            Promise.all([
                this._rawUnitService.getBrandsStatistics(brandIds)
            ]).then(value => {
                this.viewData.brandsStatistics = value[0];
            }).finally(() => {
                this.viewControl.loading$.next(false);
            });
        }
    }

    private filterConfiguration(): any {
        const filter: any = {};
        const searchText: string = this.searchInput.nativeElement.value;

        filter.filterGroup = {
            Name: searchText,
        }

        return filter;
    }

    private getBrandViewModels(brands: any[]): Array<BrandViewModel> {
        return brands.map(x => {
            let brand = new BrandViewModel();

            brand.Id = x.Id;
            brand.Name = x.Name["vi"];
            brand.CreatedAt = x.CreatedAt;
            brand.UpdatedAt = x.UpdatedAt;

            return brand;
        });
    }

    private bindDataSource(): void {
        const queryParams = new QueryParamsModel(this.filterConfiguration());

        this.viewData.dataSource.init(this.viewData.brands$, queryParams);
    }

    private bindBreadcrumbs() {
        this._subheaderService.setBreadcrumbs([
            { title: "RAW_UNITS.MERCHANTS_LIST", page: '/merchant-unit' }
        ])
    }

    private bindSubscribes() {
        this._obsers.push(
            this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0))
        );

        this._obsers.push(
            this.viewData.brands$.subscribe(brands => {
                if (brands && brands.length > 0) {
                    this.viewData.brandsStored = brands;
                }
            })
        );

        this._obsers.push(
            this._rawUnitsState.brands$.subscribe(res => {
                if (res && res.length > 0) {
                    let brands = this.getBrandViewModels(res);
                    this.viewData.brands$.next(brands);

                    this.viewControl.readyConditions.set("Brands", true);

                    this.init();
                }
            })
        );

        this._obsers.push(
            this.viewData.dataSource.entitySubject.subscribe(res => {
                this.viewData.brandsResult = res;
                this.loadBrandsStatistics(res.map(x => x.Id));
            })
        );
    }

    private bindEvents(): void {
        this._obsers.push(
            merge(this.sort.sortChange, this.paginator.page)
                .pipe(
                    tap(() => {
                        this.loadBrands();
                        this.loadBrandsStatistics(this.viewData.brandsResult.map(x => x.Id));
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
                        this.paginator.pageIndex = 0;
                        this.saveFilter('text', this.searchInput.nativeElement.value);
                        this.loadBrands();
                        this.loadBrandsStatistics(this.viewData.brandsResult.map(x => x.Id));
                    })
                )
                .subscribe()
        );
    }

    private saveFilter(key: string, value: any) {
        this._filter[key] = value;

        this._filterStorageService.set(VerificationRequestsListPage.name, this._filter);
    }

    private initFilter() {
        this._filter = this._filterStorageService.get(VerificationRequestsListPage.name);

        if (this._filter) {
            this.searchInput.nativeElement.value = this._filter['text'] || "";
        } else {
            this._filter = {};
        }
    }
}
