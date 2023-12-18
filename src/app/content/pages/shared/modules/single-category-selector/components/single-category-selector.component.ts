import { Component, OnInit, ChangeDetectionStrategy, ElementRef, ViewChild, Inject } from '@angular/core';
import { MatPaginator, MatSort, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { BehaviorSubject, merge, fromEvent } from 'rxjs';

import {
    CategoryViewModel,

    CategoryModel,

    CategoriesDataSource,
    QueryParamsModel,

    CategoryService,

    CategoryUtility,

    CategoryTransformer,
} from '../../../../../../core/core.module';
import { distinctUntilChanged, debounceTime, tap } from 'rxjs/operators';

@Component({
    selector: 'm-single-category-selector',
    templateUrl: './single-category-selector.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SingleCategorySelectorComponent implements OnInit {

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild('searchInput', { static: true }) searchInput: ElementRef;

    private _obsers: any[] = [];

    lang: string = "vi";

    viewFilter: any = {
        filterStatus: "2"
    };

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false)
    }

    viewData: any = {
        displayedColumns: ["Select", "Name", "Status"],
        dataSource: new CategoriesDataSource(),
        selectedCategory: new CategoryViewModel(),
        categories: new Array<CategoryModel>(),
        categories$: new BehaviorSubject<CategoryViewModel[]>([]),
        categoriesResult: new Array<CategoryViewModel>(),
        categoriesStored: new Array<CategoryViewModel>()
    }

    constructor(
        private _categoryService: CategoryService,
        private _categoryUtil: CategoryUtility,
        private _categoryTransformer: CategoryTransformer,
        public dialogRef: MatDialogRef<SingleCategorySelectorComponent>,
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
        this.viewFilter.filterStatus = data.filter['status-category'] || "";
        this.searchInput.nativeElement.value = data.filter['text-category'] || "";
    }

    onSelectStatus(): void {
        this.loadCategories();
    }

    onCancelClick(): void {
        this.dialogRef.close({
            filter: {
                'status-category': this.viewFilter.filterStatus,
                'text-category': this.searchInput.nativeElement.value
            }
        });
    }

    onSubmit(): void {
        let model = this.viewData.categories.find(x => x.Id === this.viewData.selectedCategory.Id);

        if (model) {
            this.dialogRef.close({
                data: model,
                filter: {
                    'status-category': this.viewFilter.filterStatus,
                    'text-category': this.searchInput.nativeElement.value
                }
            })
        }
    }

    refresh(): void {
        this.viewControl.loading$.next(true);

        Promise.all([
            this._categoryService.getAll(),
        ]).then(value => {
            this.viewData.categories = this._categoryUtil.getSubCategories(value[0]);

            let vms = this.viewData.categories.map(x => this._categoryTransformer.toCategoryOverView(x));

            this.viewData.categories$.next(vms);
        }).finally(() => {
            this.viewControl.loading$.next(false);
        });
    }

    loadCategories(): void {
        const queryParams = new QueryParamsModel(
            this.filterConfiguration(),
            this.sort.direction,
            this.sort.active,
            this.paginator.pageIndex,
            this.paginator.pageSize
        );

        this.viewData.dataSource.load(this.viewData.categoriesStored, queryParams);
    }

    private init(): void {
        this.bindDataSource();
        this.bindEvents();

        this.refresh();
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

        this.viewData.dataSource.init(this.viewData.categories$, queryParams);
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0))
        );

        this._obsers.push(
            this.viewData.dataSource.entitySubject.subscribe(res => {
                this.viewData.categoriesResult = res;
            })
        );

        this._obsers.push(
            this.viewData.categories$.subscribe(res => {
                this.viewData.categoriesStored = res;
            })
        );
    }

    private bindEvents(): void {
        this._obsers.push(
            merge(this.sort.sortChange, this.paginator.page)
                .pipe(
                    tap(() => {
                        this.loadCategories();
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
                        this.loadCategories();
                    })
                )
                .subscribe()
        );
    }
}
