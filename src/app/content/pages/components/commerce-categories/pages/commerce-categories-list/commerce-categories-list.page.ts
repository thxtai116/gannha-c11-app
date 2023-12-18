import { Component, ChangeDetectionStrategy, OnDestroy, OnInit, ElementRef, ViewChild } from "@angular/core";
import { MatPaginator, MatSort, MatDialog } from '@angular/material';

import { BehaviorSubject, merge, fromEvent } from 'rxjs';
import { tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { CommerceCategoriesState } from '../../states';

import {
    BrandModel,
    CommerceCategoryModel,

    CommerceCategoriesDataSource,

    CommerceCategoryService,
    SubheaderService,
    FilterStorageService,
    QueryParamsModel,
} from '../../../../../../core/core.module';
import { CommerceCategoriesDetailComponent } from '../../components/commerce-categories-detail/commerce-categories-detail.component';
import { CommerceCategoriesFormComponent } from '../../components/commerce-categories-form/commerce-categories-form.component';

@Component({
    selector: 'm-commerce-categories-list',
    templateUrl: 'commerce-categories-list.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommerceCategoriesListPage implements OnInit, OnDestroy {

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
            "Published",
            "Order",
            "UpdatedAt",
            "Actions",
        ],
        dataSource: new CommerceCategoriesDataSource(),
        cats$: new BehaviorSubject<CommerceCategoryModel[]>([]),
        catsResult: new Array<CommerceCategoryModel[]>([]),
        catsStored: new Array<CommerceCategoryModel[]>([]),
    };

    constructor(
        private _commerceCategoriesState: CommerceCategoriesState,
        private _commerceCategoryService: CommerceCategoryService,
        private _subheaderService: SubheaderService,
        private _filterStorageService: FilterStorageService,
        public dialog: MatDialog,
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
            this._commerceCategoryService.getAll(),
        ]).then(value => {
            this.viewData.cats$.next(value[0]);
        }).finally(() => {
            this.viewControl.loading$.next(false);
        });
    }

    loadCats(): void {
        const queryParams = new QueryParamsModel(
            this.filterConfiguration(),
            this.sort.direction,
            this.sort.active,
            this.paginator.pageIndex,
            this.paginator.pageSize
        );

        this.viewData.dataSource.load(this.viewData.catsStored, queryParams);
    }

    detail(id: string): void {
        if (id) {
            const dialogRef = this.dialog.open(CommerceCategoriesDetailComponent, { data: id, panelClass: ['m-mat-dialog-container__wrapper', 'mat-dialog-container--confirmation'], disableClose: true });

            let sub = dialogRef.afterClosed().subscribe(res => {
                if (!res)
                    return;

                this.refresh();
            });

            this._obsers.push(sub);
        }
    }

    create(): void {
        const dialogRef = this.dialog.open(CommerceCategoriesFormComponent, { panelClass: ['m-mat-dialog-container__wrapper', 'mat-dialog-container--confirmation'], disableClose: true });

        let sub = dialogRef.afterClosed().subscribe(res => {
            if (!res)
                return;

            this.refresh();
        });

        this._obsers.push(sub);
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
        }

        return filter;
    }

    private bindDataSource(): void {
        const queryParams = new QueryParamsModel(this.filterConfiguration());

        this.viewData.dataSource.init(this.viewData.cats$, queryParams);
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "COMMERCE_CATEGORIES.LIST", page: '/commerce-categories' }
        ]);
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0))
        );

        this._obsers.push(
            this._commerceCategoriesState.brand$.subscribe(value => {
                if (value) {
                    this.viewData.brand = value;

                    this._readyConditions.set("Brand", true);

                    this.init();

                    this.refresh();
                }
            })
        )

        this._obsers.push(
            this.viewData.dataSource.entitySubject.subscribe(res => {
                this.viewData.catsResult = res;
            })
        );

        this._obsers.push(
            this.viewData.cats$.subscribe(res => {
                this.viewData.catsStored = res;
            })
        );
    }

    private bindEvents(): void {
        this._obsers.push(
            merge(this.sort.sortChange, this.paginator.page)
                .pipe(
                    tap(() => {
                        this.loadCats();
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
                        this.loadCats();
                    })
                )
                .subscribe()
        );
    }

    private saveFilter(key: string, value: any) {
        this._filter[key] = value;

        this._filterStorageService.set(CommerceCategoriesListPage.name, this._filter);
    }

    private initFilter() {
        this._filter = this._filterStorageService.get(CommerceCategoriesListPage.name);

        if (this._filter) {
            this.searchInput.nativeElement.value = this._filter['text'] || "";
        } else {
            this._filter = {};
        }
    }
}