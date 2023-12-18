import { Component, ChangeDetectionStrategy, ViewChild, ElementRef, OnInit } from "@angular/core";
import { MatPaginator, MatSort } from '@angular/material';
import { BehaviorSubject, merge, fromEvent } from 'rxjs';
import { tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { QueryParamsModel, SubheaderService, FilterStorageService, DiscountsDataSource, DiscountViewModel, DiscountModel, BrandModel, DiscountTransformer } from '../../../../../../core/core.module';
import { TranslateService } from '@ngx-translate/core';
import { DiscountsState } from '../../states';
import { DiscountService } from '../../../../../../core/core.module';

@Component({
    selector: 'm-discounts-list',
    templateUrl: 'discounts-list.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiscountsListPage implements OnInit {

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
            "DiscountType",
            "FromTo",
            "CreatedAt",
            "Actions",
        ],
        dataSource: new DiscountsDataSource(),
        discounts$: new BehaviorSubject<DiscountViewModel[]>([]),
        discountsStored: new Array<DiscountViewModel[]>([]),
        discountsResult: new Array<DiscountViewModel[]>([]),
    };

    viewFilter: any = {
        filterDiscountType: ""
    };

    constructor(
        private _discountsState: DiscountsState,
        private _subheaderService: SubheaderService,
        private _discountService: DiscountService,
        private _filterStorageService: FilterStorageService,
        private _discountTransformer: DiscountTransformer,
        private _translate: TranslateService,
    ) {
    }

    ngOnInit(): void {
        this.viewControl.loading$ = this.viewData.dataSource.loadingSubject;
        this.viewControl.loading$.next(true);

        this.initFilter();

        this.bindSubscribes();
    }

    refresh(): void {
        this.viewControl.loading$.next(true);

        Promise.all([
            this._discountService.getAll()
        ]).then(value => {
            let discounts = value[0];
            let vms = discounts.map(value => {
                return this._discountTransformer.toDiscountViewModel(value);
            });

            this.viewData.discounts$.next(vms);

            this.loadDiscounts();
        }).finally(() => {
            this.viewControl.loading$.next(false);
        });
    }

    loadDiscounts(): void {
        const queryParams = new QueryParamsModel(
            this.filterConfiguration(),
            this.sort.direction,
            this.sort.active,
            this.paginator.pageIndex,
            this.paginator.pageSize
        );

        this.viewData.dataSource.load(this.viewData.discountsStored, queryParams);
    }

    private init(): void {
        if (Array.from(this._readyConditions.values()).filter(x => x === false).length === 0) {
            if (this.viewControl.ready) return;
            this.viewControl.ready = true;

            this.bindBreadcrumbs();

            Promise.all([
                this._discountService.getAll()
            ]).then(value => {
                let discounts = value[0];
                let vms = discounts.map(value => {
                    return this._discountTransformer.toDiscountViewModel(value);
                });

                this.viewData.discounts$.next(vms);

                this.loadDiscounts();
            }).finally(() => {
                this.viewControl.loading$.next(false);
            });

            this.bindDataSource();
            this.bindEvents();
        }
    }

    private bindDataSource(): void {
        const queryParams = new QueryParamsModel(this.filterConfiguration());

        this.viewData.dataSource.init(this.viewData.discounts$, queryParams);
    }

    private filterConfiguration(): any {
        const filter: any = {};

        const searchText: string = this.searchInput.nativeElement.value;

        if (this.viewFilter.filterDiscountType) {
            filter.DiscountType = this.viewFilter.filterDiscountType;
        }

        filter.Name = searchText;

        return filter;
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "DISCOUNTS.LIST", page: `/discounts` }
        ]);
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0))
        );

        this._obsers.push(
            this._discountsState.brand$.subscribe(value => {
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
            this.viewData.dataSource.entitySubject.subscribe(res => {
                if (res) {
                    this.viewData.discountsResult = res.map(value => this._discountTransformer.toDiscountViewModel(value));
                }
            })
        );

        this._obsers.push(
            this.viewData.discounts$.subscribe(value => {
                this.viewData.discountsStored = value;
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
                        this.loadDiscounts();
                    })
                )
                .subscribe()
        );

        this._obsers.push(
            fromEvent(this.searchInput.nativeElement, 'keyup')
                .pipe(
                    debounceTime(250),
                    distinctUntilChanged(),
                    tap(() => {
                        this.saveFilter('text', this.searchInput.nativeElement.value);
                        this.loadDiscounts();
                    })
                )
                .subscribe()
        );
    }

    private saveFilter(key: string, value: any) {
        this._filter[key] = value;

        this._filterStorageService.set(DiscountsListPage.name, this._filter);
    }

    private initFilter() {
        this._filter = this._filterStorageService.get(DiscountsListPage.name);

        if (this._filter) {
            this.searchInput.nativeElement.value = this._filter['text'] || "";
        } else {
            this._filter = {};
        }
    }
}