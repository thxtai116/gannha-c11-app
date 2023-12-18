import { Component, OnInit, ChangeDetectionStrategy, ElementRef, ViewChild, Inject } from '@angular/core';
import { MatDialogRef, MatPaginator, MatSort, MAT_DIALOG_DATA, MatDialog } from '@angular/material';

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
} from '../../../../../../../core/core.module';

import { SelectionModel } from '@angular/cdk/collections';

import { fromEvent, merge, BehaviorSubject } from 'rxjs';

import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { SelectionPreviewComponent } from '../../../../components/selection-preview/selection-preview.component';

@Component({
    selector: 'm-collection-brands-selector',
    templateUrl: './brands-selector.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrandsSelectorComponent implements OnInit {
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild('searchInput', { static: true }) searchInput: ElementRef;

    private _obsers: any[] = [];

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false)
    }

    viewFilter: any = {
        filterStatus: "",
        filterCategory: ""
    };

    viewData: any = {
        displayedColumns: ["Select", "Name", "CategoryNames", "Status"],
        dataSource: new BrandsDataSource(),
        categories: new Array<CategoryModel>(),
        filterCategories$: new BehaviorSubject<any[]>([]),
        currentSelection: new SelectionModel<BrandViewModel>(true, []),
        globalSelection: new Array<any>(),
        initialBrands: new Array<string>(),
        originBrands: new Array<BrandModel>(),
        brands$: new BehaviorSubject<BrandViewModel[]>([]),
        brandsResult: new Array<BrandViewModel>(),
        brandsStored: new Array<BrandViewModel>()
    }

    lang: string = "vi";

    constructor(
        private _categoryService: CategoryService,
        private _brandService: BrandService,
        private _categoryUtil: CategoryUtility,
        private _brandTransformer: BrandTransformer,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<BrandsSelectorComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
    }

    ngOnInit(): void {
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
        this.viewData.initialBrands = data.selected || [];

        this.viewFilter.filterStatus = data.filter['status-brand'] || "";
        this.viewFilter.filterCategory = data.filter['category-brand'] || "";
        this.searchInput.nativeElement.value = data.filter['text-brand'] || "";
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

    isAllSelected(): boolean {
        const numSelected = this.viewData.currentSelection.selected.length;
        const numRows = this.viewData.dataSource.paginatorTotalSubject.value;

        return numSelected === numRows;
    }

    masterToggle(): void {
        if (this.isAllSelected()) {
            this.viewData.currentSelection.clear();
        } else {
            this.viewData.dataSource.entityStoredSubject.value.forEach(row => this.viewData.currentSelection.select(row));
        }

        this.onSelectedBrandsChange();
    }

    toggleRow(row: any) {
        this.viewData.currentSelection.toggle(row);

        this.onSelectedBrandsChange();
    }

    onPreviewSelection(): void {
        let data = {
            selectedItems: this.viewData.globalSelection.map(x => x.Name[this.lang])
        }

        const dialogRef = this.dialog.open(SelectionPreviewComponent, { data: data, panelClass: ['m-mat-dialog-container__wrapper', 'mat-dialog-container--confirmation'], disableClose: true });

        let sub = dialogRef.afterClosed().subscribe(value => {
            sub.unsubscribe();
        });
    }

    onClearSelection(): void {
        this.viewData.globalSelection = [];
        this.viewData.currentSelection.clear();

        this.onSelectedBrandsChange();
    }

    onSelectStatus(): void {
        this.loadBrands();
    }

    async onSelectCategory() {
        this.viewControl.loading$.next(true);

        Promise.all([
            this._brandService.getAll(this.viewFilter.filterCategory)
        ]).then(value => {
            this.viewData.originBrands = value[0];

            let vms = value[0].filter(x => this.viewData.initialBrands.indexOf(x.Id) === -1).map(x => this._brandTransformer.toBrandOverView(x));

            for (let vm of vms) {
                vm.CategoryNames = vm.Categories.map(x => {
                    let cat = this._categoryUtil.getCategoryById(x, this.viewData.categories);

                    if (cat)
                        return new LanguagePipe().transform(cat.Name);
                });
            }

            this.viewData.brands$.next(vms);
        }).finally(() => {
            this.updateCurrentSelection(this.viewData.globalSelection)
            this.viewControl.loading$.next(false);
        });
    }

    onCancelClick(): void {
        this.dialogRef.close({
            filter: {
                'status-brand': this.viewFilter.filterStatus,
                'category-brand': this.viewFilter.filterCategory,
                'text-brand': this.searchInput.nativeElement.value
            }
        });
    }

    onSubmit(): void {
        if (this.viewData.globalSelection.length === 0)
            return;

        this.dialogRef.close({
            data: this.viewData.globalSelection,
            filter: {
                'status-brand': this.viewFilter.filterStatus,
                'category-brand': this.viewFilter.filterCategory,
                'text-brand': this.searchInput.nativeElement.value
            }
        });
    }

    private init(): void {
        this.bindDataSource();
        this.bindEvents();

        Promise.all([
            this._categoryService.getAll(),
        ]).then(value => {
            this.viewData.categories = this._categoryUtil.getSubCategories(value[0]);

            this.viewData.filterCategories$.next(this.initFilterCategories(this.viewData.categories));
        }).finally(() => {
            if (this.viewFilter.filterCategory && this.viewFilter.filterCategory.length > 0) {
                this.onSelectCategory();
            }

            this.viewControl.loading$.next(false);
        });
    }

    private initFilterCategories(categories: CategoryModel[]): any[] {
        let cats = [
            {
                id: "All",
                text: "Tất cả"
            }
        ];

        cats = cats.concat(categories.map(x => {
            return {
                id: x.Id,
                text: new LanguagePipe().transform(x.Name)
            }
        }));

        return cats;
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

    private updateCurrentSelection(models: Array<any>) {
        this.viewData.currentSelection.clear();
        this.viewData.dataSource.entityStoredSubject.value.forEach(row => {
            if (models.map(x => x.Id).indexOf(row.Id) > -1) {
                this.viewData.currentSelection.select(row);
            }
        })
    }

    private onSelectedBrandsChange(): void {
        let data = this.viewData.currentSelection.selected.map(x => x.Id);

        for (var i = 0; i < this.viewData.originBrands.length; i++) {
            let brand = this.viewData.originBrands[i]
            let item = this.viewData.globalSelection.find(x => x.Id == brand.Id);

            if (data.indexOf(brand.Id) > -1) {
                if (!item) {
                    this.viewData.globalSelection.push(brand);
                }
            } else {
                if (item) {
                    this.viewData.globalSelection.splice(this.viewData.globalSelection.indexOf(item))
                }
            }
        }
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