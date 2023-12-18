import { Component, OnInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { MatPaginator, MatSort, MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { BehaviorSubject, merge, fromEvent } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import { tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import {
    CategoryTransformer,
    CategoriesDataSource,

    QueryParamsModel,
    CategoryViewModel,

    CategoryService,

    CategoryUtility,
} from '../../../../../core/core.module';
import { SelectionPreviewComponent } from '../selection-preview/selection-preview.component';

@Component({
    selector: 'm-categories-selector',
    templateUrl: './categories-selector.component.html',
    styleUrls: ['./categories-selector.component.scss']
})
export class CategoriesSelectorComponent implements OnInit {

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild('searchInput', { static: true }) searchInput: ElementRef;

    private _obsers: any[] = [];

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false)
    }

    viewFilter: any = {
        filterStatus: ""
    };

    viewData: any = {
        displayedColumns: ["Select", "Index", "Name", "Status"],
        dataSource: new CategoriesDataSource(),
        selection: new SelectionModel<CategoryViewModel>(true, []),
        initialCategories: new Array<string>(),
        categories$: new BehaviorSubject<CategoryViewModel[]>([]),
        categoriesResult: new Array<CategoryViewModel>(),
        categoriesStored: new Array<CategoryViewModel>()
    }

    constructor(
        public dialogRef: MatDialogRef<CategoriesSelectorComponent>,
        private _categoryService: CategoryService,
        private _categoryTransformer: CategoryTransformer,
        private _categoryUtil: CategoryUtility,
        public dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: any) {

    }

    ngOnInit() {
        this.viewControl.loading$ = this.viewData.dataSource.loadingSubject;
        this.viewControl.loading$.next(true);

        this.parseInjectionData(this.data);

        this.init();

        this.bindSubscribes();
    }

    private parseInjectionData(data: any) {
        this.viewData.initialCategories = data.selectedCategories || [];
        this.viewFilter.filterStatus = data.filter['status'] || "";
        this.searchInput.nativeElement.value = data.filter['text'] || "";
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
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

    onSelectStatus(): void {
        this.loadCategories();
    }

    onCancelClick(): void {
        this.dialogRef.close({
            filter: {
                'status': this.viewFilter.filterStatus,
                'text': this.searchInput.nativeElement.value
            }
        });
    }

    onSubmit(): void {
        if (this.viewData.selection.selected.length === 0)
            return;

        this.dialogRef.close({
            data: this.viewData.selection.selected.map(x => x.Id),
            filter: {
                'status': this.viewFilter.filterStatus,
                'text': this.searchInput.nativeElement.value
            }
        });
    }

    unselectAll(): void {
        this.viewData.selection.clear();
    }

    private init(): void {
        this.bindDataSource();
        this.bindEvents();

        Promise.all([
            this._categoryService.getAll()
        ]).then(value => {
            let categories = this._categoryUtil.getSubCategories(value[0]).filter(x => this.viewData.initialCategories.indexOf(x.Id) === -1);

            let vms = categories.map(x => this._categoryTransformer.toCategoryOverView(x));

            this.viewData.selection = new SelectionModel<CategoryViewModel>(true, [...vms.filter(x => this.viewData.initialCategories.indexOf(x.Id) !== -1)]);

            this.viewData.categories$.next(vms);

            this.viewControl.loading$.next(false);
        }).catch(() => {
            this.viewControl.loading$.next(false);
        });
    }

    private bindDataSource(): void {
        const queryParams = new QueryParamsModel(this.filterConfiguration());
        this.viewData.dataSource.init(this.viewData.categories$, queryParams);
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
