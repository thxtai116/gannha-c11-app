import { Component, OnInit, ChangeDetectionStrategy, Inject, ElementRef, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatPaginator, MatSort } from '@angular/material';

import { BehaviorSubject, merge, fromEvent } from 'rxjs';

import {
    BrandsDataSource,

    BrandViewModel,
    BrandModel,
    CategoryModel,
    QueryParamsModel,

    BrandService,
    CategoryService,

    BrandTransformer,

    CategoryUtility,
    LanguagePipe,
} from '../../../../../../core/core.module';
import { tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';


@Component({
    selector: 'm-single-brand-selector',
    templateUrl: './single-brand-selector.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SingleBrandSelectorComponent implements OnInit {

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild('searchInput', { static: true }) searchInput: ElementRef;

    private _obsers: any[] = [];

    lang: string = "vi";

    viewFilter: any = {
        filterStatus: "2",
        filterCategory: ""
    };

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false)
    }

    viewData: any = {
        displayedColumns: ["Select", "Name", "CategoryNames", "Status"],
        dataSource: new BrandsDataSource(),
        selectedBrand: new BrandViewModel(),
        originBrands$: new Array<BrandModel>(),
        categories: new Array<CategoryModel>(),
        filterCategories$: new BehaviorSubject<any[]>([]),
        brands$: new BehaviorSubject<BrandViewModel[]>([]),
        brandsResult: new Array<BrandViewModel>(),
        brandsStored: new Array<BrandViewModel>()
    }

    constructor(
        private _brandService: BrandService,
        private _categoryService: CategoryService,
        private _categoryUtil: CategoryUtility,
        private _brandTransformer: BrandTransformer,
        public dialogRef: MatDialogRef<SingleBrandSelectorComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {

    }

    ngOnInit() {
        this.viewControl.loading$ = this.viewData.dataSource.loadingSubject;
        this.viewControl.loading$.next(true);

        this.parseInjectionData(this.data);
        this.init();

        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    private parseInjectionData(data: any) {
        this.viewFilter.filterCategory = data.filter['category-brand'] || "";
        this.viewFilter.filterStatus = data.filter['status-brand'] || "2";
        this.searchInput.nativeElement.value = data.filter['text-brand'] || "";
    }

    onCancelClick(): void {
        this.dialogRef.close({
            filter: {
                'category-brand': this.viewFilter.filterCategory,
                'status-brand': this.viewFilter.filterStatus,
                'text-brand': this.searchInput.nativeElement.value
            }
        });
    }

    onSubmit(): void {
        let model = this.viewData.originBrands.find(x => x.Id === this.viewData.selectedBrand.Id);

        if (model) {
            this.dialogRef.close({
                data: model,
                filter: {
                    'category-brand': this.viewFilter.filterCategory,
                    'status-brand': this.viewFilter.filterStatus,
                    'text-brand': this.searchInput.nativeElement.value
                }
            })
        }
    }

    refresh(): void {
        if (!this.viewFilter.filterCategory || this.viewFilter.filterCategory.length === 0)
            return;

        this.onSelectCategory();
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

    async onSelectCategory() {
        this.viewData.selectedBrand = new BrandViewModel();

        this.viewControl.loading$.next(true);

        Promise.all([
            this._brandService.getAll(this.viewFilter.filterCategory)
        ]).then(value => {
            this.viewData.originBrands = value[0];

            let vms = value[0].map(x => this._brandTransformer.toBrandOverView(x));

            for (let vm of vms) {
                vm.CategoryNames = vm.Categories.map(x => {
                    let cat = this._categoryUtil.getCategoryById(x, this.viewData.categories);

                    if (cat)
                        return new LanguagePipe().transform(cat.Name);
                });
            }

            this.viewData.brands$.next(vms);
        }).finally(() => {
            this.viewControl.loading$.next(false);
        });
    }

    onSelectStatus(): void {
        this.loadBrands();
    }

    private init(): void {
        this.bindDataSource();
        this.bindEvents();

        Promise.all([
            this._categoryService.getAll(),
        ]).then(value => {
            this.viewData.categories = this._categoryUtil.getSubCategories(value[0]);

            this.viewData.filterCategories$.next(this._categoryUtil.initFilterCategories(this.viewData.categories, false));

            if (this.viewFilter.filterCategory && this.viewFilter.filterCategory.length > 0) {
                this.onSelectCategory();
            }
        }).finally(() => {
            this.viewControl.loading$.next(false);
        });
    }

    private filterConfiguration(): any {
        const filter: any = {};

        const searchText: string = this.searchInput.nativeElement.value;

        if (this.viewFilter.filterStatus && this.viewFilter.filterStatus.length > 0) {
            filter.Status = this.viewFilter.filterStatus;
        }

        filter.Name = searchText;

        return filter;
    }

    private bindDataSource(): void {
        const queryParams = new QueryParamsModel(this.filterConfiguration());

        this.viewData.dataSource.init(this.viewData.brands$, queryParams);
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0))
        );

        this._obsers.push(
            this.viewData.dataSource.entitySubject.subscribe(res => {
                this.viewData.brandsResult = res;
            })
        );

        this._obsers.push(
            this.viewData.brands$.subscribe(res => {
                this.viewData.brandsStored = res;
            })
        );
    }

    private bindEvents(): void {
        this._obsers.push(
            merge(this.sort.sortChange, this.paginator.page)
                .pipe(
                    tap(() => {
                        this.loadBrands();
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
                        this.loadBrands();
                    })
                )
                .subscribe()
        );
    }
}
