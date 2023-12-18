import { Component, ChangeDetectionStrategy, OnDestroy, OnInit, ElementRef, ViewChild } from "@angular/core";
import { MatPaginator, MatSort } from '@angular/material';

import { BehaviorSubject, merge, fromEvent } from 'rxjs';

import { CommerceProductsState } from '../../states';

import {
    BrandModel,
    CommerceProductModel,
    QueryParamsModel,

    CommerceProductsDataSource,

    CommerceProductService,
    SubheaderService,
    FilterStorageService,
} from '../../../../../../core/core.module';
import { tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
    selector: 'm-products-list',
    templateUrl: 'products-list.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsListPage implements OnInit, OnDestroy {

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild('searchInput', { static: true }) searchInput: ElementRef;

    private _obsers: any[] = [];
    private _filter: any = {};

    private _readyConditions: Map<string, boolean> = new Map([
        ["Brand", false]
    ]);

    viewControl: any = {
        ready: false,
        loading$: new BehaviorSubject<boolean>(false)
    };

    viewData: any = {
        brand: new BrandModel(),
        displayedColumns: [
            "Index",
            "Name",
            "Sku",
            "Price",
            "Published",
            "UpdatedAt",
            "Actions",
        ],
        dataSource: new CommerceProductsDataSource(),
        products$: new BehaviorSubject<CommerceProductModel[]>([]),
        productsResult: new Array<CommerceProductModel[]>([]),
        productsStored: new Array<CommerceProductModel[]>([]),
    };

    constructor(
        private _commerceProductsState: CommerceProductsState,
        private _commerceProductService: CommerceProductService,
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
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    refresh(): void {
        this.viewControl.loading$.next(true);

        Promise.all([
            this._commerceProductService.getAll(),
        ]).then(value => {
            this.viewData.products$.next(value[0]);
        }).finally(() => {
            this.viewControl.loading$.next(false);
        });
    }

    loadProducts(): void {
        const queryParams = new QueryParamsModel(
            this.filterConfiguration(),
            this.sort.direction,
            this.sort.active,
            this.paginator.pageIndex,
            this.paginator.pageSize
        );

        this.viewData.dataSource.load(this.viewData.productsStored, queryParams);
    }

    private init(): void {
        if (Array.from(this._readyConditions.values()).filter(x => x === false).length === 0) {
            if (this.viewControl.ready) return;

            this.viewControl.ready = true;

            this.bindBreadcrumbs();
            this.bindDataSource();
            this.bindEvents();

            this.viewControl.loading$.next(false);
        }
    }

    private filterConfiguration(): any {
        const filter: any = {};

        const searchText: string = this.searchInput.nativeElement.value;

        filter.filterGroup = {
            Name: searchText,
            Sku: searchText,
        }

        return filter;
    }

    private bindDataSource(): void {
        const queryParams = new QueryParamsModel(this.filterConfiguration());

        this.viewData.dataSource.init(this.viewData.products$, queryParams);
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "COMMERCE_PRODUCTS.LIST", page: '/products' }
        ]);
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0))
        );

        this._obsers.push(
            this._commerceProductsState.brand$.subscribe(value => {
                if (value) {
                    this.viewData.brand = value;

                    this._readyConditions.set("Brand", true);

                    if (!this.viewControl.ready) {
                        this.init();
                    }

                    this.refresh();
                }
            })
        )

        this._obsers.push(
            this.viewData.dataSource.entitySubject.subscribe(res => {
                this.viewData.productsResult = res;
            })
        );

        this._obsers.push(
            this.viewData.products$.subscribe(res => {
                this.viewData.productsStored = res;
            })
        );
    }

    private bindEvents(): void {
        this._obsers.push(
            merge(this.sort.sortChange, this.paginator.page)
                .pipe(
                    tap(() => {
                        this.loadProducts();
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
                        this.loadProducts();
                    })
                )
                .subscribe()
        );
    }

    private saveFilter(key: string, value: any) {
        this._filter[key] = value;

        this._filterStorageService.set(ProductsListPage.name, this._filter);
    }

    private initFilter() {
        this._filter = this._filterStorageService.get(ProductsListPage.name);

        if (this._filter) {
            this.searchInput.nativeElement.value = this._filter['text'] || "";
        } else {
            this._filter = {};
        }
    }
}