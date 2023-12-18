import { Component, OnInit, ChangeDetectionStrategy, ViewChild, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { FormControl, Validators } from '@angular/forms';

import { BehaviorSubject, merge } from 'rxjs';
import { tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { SellingPointTimelineComponent } from '../../../../components';

import {
    SellingPointsDataSource,

    SellingPointOverviewViewModel,
    SellingPointModel,
    QueryParamsModel,

    BrandService,

    SellingPointTransformer,

    LanguagePipe,
    SellingPointService,
    CategoryService,
    CategoryUtility,

    SystemAlertService,

    MinArray,
    MaxArray,
} from '../../../../../../../core/core.module';

import { SelectionPreviewComponent } from '../../../../components/selection-preview/selection-preview.component';


@Component({
    selector: 'm-multi-brand-selling-points-selector',
    templateUrl: './multi-brand-selling-points-selector.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MultiBrandSellingPointsSelectorComponent implements OnInit, OnDestroy {
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    @Input()
    set data(value) {
        this._data$.next(value);
    };

    get data() {
        return this._data$.getValue();
    }

    @Output() onChange: EventEmitter<string[]> = new EventEmitter<string[]>();
    @Output() onFilterChange: EventEmitter<any[]> = new EventEmitter<any>();

    private _obsers: any[] = [];
    private _data$ = new BehaviorSubject<any>(null);

    lang: string = "vi";

    viewFilter: any = {
        filterMode: new FormControl('search'),

        filterCategory: new FormControl(""),
        filterBrand: new FormControl([], [<any>Validators.required, MinArray.validate(1), MaxArray.validate(5)]),
        filterDate: new FormControl([new Date(), new Date()]),
        filterTimeRange: [new FormControl('00'), new FormControl('24')],

        filterStatus: new FormControl(''),
        filterText: new FormControl(''),
    };

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false),
    }

    viewData: any = {
        displayedColumns: ["Select", "Index", "Title", "BrandName", "StartDate", "EndDate", "Picture", "Status"],
        dataSource: new SellingPointsDataSource(),
        currentSelection: new SelectionModel<SellingPointOverviewViewModel>(true, []),
        globalSelection: new Array<any>(),
        initialSellingPoints: new Array<string>(),
        originSellingPoints: new Array<SellingPointModel[]>(),
        brands$: new BehaviorSubject<any[]>([]),
        categories$: new BehaviorSubject<any>([]),
        sellingPoints$: new BehaviorSubject<SellingPointOverviewViewModel[]>([]),
        sellingPointsResult: new Array<SellingPointOverviewViewModel>(),
        sellingPointsStored: new Array<SellingPointOverviewViewModel>(),

        hourOptions: ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24"],
    }

    constructor(
        private _brandService: BrandService,
        private _categoryService: CategoryService,
        private _sellingPointService: SellingPointService,
        private _sellingPointTransformer: SellingPointTransformer,
        private _categoryUtil: CategoryUtility,
        private _translate: TranslateService,
        private _systemAlertService: SystemAlertService,
        public dialog: MatDialog,
    ) {
    }

    ngOnInit(): void {
        this.bindSubscribes();
        this.init();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
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

        this.onSelectedSellingPointsChange();
    }

    toggleRow(row: any) {
        this.viewData.currentSelection.toggle(row);

        this.onSelectedSellingPointsChange();
    }

    onPreviewSelection(): void {
        let data = {
            selectedItems: this.viewData.globalSelection.map(x => x.Detail.Title[this.lang])
        }

        this.dialog.open(SelectionPreviewComponent, { data: data, panelClass: ['m-mat-dialog-container__wrapper', 'mat-dialog-container--confirmation'], disableClose: true });
    }

    onShowTimeline(): void {
        let data = this.viewData.globalSelection.map(x => this._sellingPointTransformer.toSellingPointOverview(x));

        this.dialog.open(SellingPointTimelineComponent, { data: data, disableClose: true });
    }

    onClearSelection(): void {
        this.viewData.globalSelection = [];
        this.viewData.currentSelection.clear();

        this.onSelectedSellingPointsChange();
    }

    search(): void {
        this.viewFilter.filterBrand.markAsTouched();

        if (this.viewFilter.filterBrand.invalid) {
            this._systemAlertService.error(this._translate.instant("COMMON.ERROR.FORM_INVALID"));

            return;
        }

        this.viewControl.loading$.next(true);

        Promise.all([
            this._sellingPointService.searchByBrand(
                this.viewFilter.filterBrand.value,
                this.viewFilter.filterDate.value[0],
                this.viewFilter.filterDate.value[1],
                +this.viewFilter.filterTimeRange[0].value,
                +this.viewFilter.filterTimeRange[1].value)
        ]).then(value => {
            this.viewData.originSellingPoints = value[0].filter(x => this.viewData.initialSellingPoints.indexOf(x.Id) === -1);

            let vms = this.viewData.originSellingPoints.map(value => {
                let vm = this._sellingPointTransformer.toSellingPointOverview(value);

                vm.BrandId = value.BrandId;

                let brand = this.viewData.brands$.getValue().find(x => x.id === vm.BrandId);

                if (brand) {
                    vm.BrandName = brand.text;
                }

                return vm;
            });

            this.viewData.sellingPoints$.next(vms);

            this.loadSellingPoints();
        }).finally(() => {
            this.updateCurrentSelection(this.viewData.globalSelection);
            this.viewControl.loading$.next(false);
        });
    }

    private parseInjectionData(data: any) {
        this.viewData.initialSellingPoints = data.selected || [];

        this.viewFilter.filterMode.setValue(data.filter['mb-filter-mode'] || "search");

        this.viewFilter.filterCategory.setValue(data.filter['mb-category-selling-point'] || "");
        this.viewFilter.filterBrand.setValue(data.filter['mb-brand-selling-point'] || []);
        this.viewFilter.filterDate.setValue(data.filter['mb-date-selling-point'] || [new Date(), new Date()]);

        this.viewFilter.filterTimeRange[0].setValue(data.filter['mb-time-selling-point'] && data.filter['mb-time-selling-point'][0] ? data.filter['mb-time-selling-point'][0] : '00');
        this.viewFilter.filterTimeRange[1].setValue(data.filter['mb-time-selling-point'] && data.filter['mb-time-selling-point'][1] ? data.filter['mb-time-selling-point'][1] : '24');

        this.viewFilter.filterStatus.setValue(data.filter['mb-status-selling-point'] || '');
        this.viewFilter.filterText.setValue(data.filter['mb-text-selling-point'] || '');
    }

    private updateCurrentSelection(models: Array<any>) {
        this.viewData.currentSelection.clear();
        this.viewData.dataSource.entityStoredSubject.value.forEach(row => {
            if (models.map(x => x.Id).indexOf(row.Id) > -1) {
                this.viewData.currentSelection.select(row);
            }
        })
    }

    private onSelectedSellingPointsChange(): void {
        let data = this.viewData.currentSelection.selected.map(x => x.Id);

        for (var i = 0; i < this.viewData.originSellingPoints.length; i++) {
            let sp = this.viewData.originSellingPoints[i]
            let item = this.viewData.globalSelection.find(x => x.Id == sp.Id);

            if (data.indexOf(sp.Id) > -1) {
                if (!item) {
                    this.viewData.globalSelection.push(sp);
                }
            } else {
                if (item) {
                    this.viewData.globalSelection.splice(this.viewData.globalSelection.indexOf(item))
                }
            }
        }

        this.onChange.emit(this.viewData.globalSelection);
    }

    private loadSellingPoints(): void {
        const queryParams = new QueryParamsModel(
            this.filterConfiguration(),
            this.sort.direction,
            this.sort.active,
            this.paginator.pageIndex,
            this.paginator.pageSize
        );

        this.viewData.dataSource.load(this.viewData.sellingPointsStored, queryParams);
    }

    private filterConfiguration(): any {
        const filter: any = {};

        let searchText = this.viewFilter.filterText.value;
        if (searchText && searchText.length > 0) {
            filter.Title = searchText
        }

        filter.Status = this.viewFilter.filterStatus.value;

        return filter;
    }

    private getBrands(cat: string): any {
        this.viewControl.loading$.next(true);

        Promise.all([
            this._brandService.getAll(cat === "All" ? null : cat),
        ]).then(value => {
            let brands = value[0].map(x => {
                return {
                    id: x.Id,
                    text: new LanguagePipe().transform(x.Name)
                };
            });

            this.viewData.brands$.next(brands);

            if (this.viewFilter.filterBrand.value.length > 0) {
                this.search();
            }
        }).finally(() => {
            this.viewControl.loading$.next(false);
        });
    }

    private init(): void {
        this.bindDataSource();
        this.bindEvents();

        Promise.all([
            this._categoryService.getAll(),
        ]).then(value => {
            let subCats = this._categoryUtil.getSubCategories(value[0]);
            let cats = this._categoryUtil.initFilterCategories(subCats);

            this.viewData.categories$.next(cats);
        }).finally(() => {
            this.viewControl.loading$.next(false);
        });
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0))
        );

        this._obsers.push(
            this.viewData.dataSource.entitySubject.subscribe(res => {
                this.viewData.sellingPointsResult = res;
            })
        );

        this._obsers.push(
            this.viewData.sellingPoints$.subscribe(res => {
                this.viewData.sellingPointsStored = res;
            })
        );

        this._obsers.push(
            this.viewFilter.filterMode.valueChanges.subscribe(() => {
                this.filterChange();
            })
        );

        this._obsers.push(
            this.viewFilter.filterCategory.valueChanges.subscribe(value => {
                this.filterChange();
                this.getBrands(value);
            })
        );

        this._obsers.push(
            this.viewFilter.filterBrand.valueChanges.subscribe(() => {
                this.filterChange();
            })
        );

        this._obsers.push(
            this.viewFilter.filterDate.valueChanges.subscribe(() => {
                this.filterChange();
            })
        );

        this._obsers.push(
            this.viewFilter.filterTimeRange[0].valueChanges.subscribe(() => {
                this.filterChange();
            })
        );

        this._obsers.push(
            this.viewFilter.filterTimeRange[1].valueChanges.subscribe(() => {
                this.filterChange();
            })
        );

        this._obsers.push(
            this.viewFilter.filterStatus.valueChanges.subscribe(() => {
                this.filterChange();
                this.loadSellingPoints();
            })
        );

        this._obsers.push(
            this.viewFilter.filterText.valueChanges.pipe(
                debounceTime(150),
                distinctUntilChanged(),
                tap(() => {
                    this.filterChange();
                    this.loadSellingPoints();
                })
            ).subscribe()
        );

        this._obsers.push(
            this._data$.subscribe(value => {
                if (value) {
                    this.parseInjectionData(value);

                    if (this.viewFilter.filterBrand.length > 0) {
                        this.search();
                    }
                }
            })
        );
    }

    private bindDataSource(): void {
        const queryParams = new QueryParamsModel(this.filterConfiguration());

        this.viewData.dataSource.init(this.viewData.sellingPoints$, queryParams);
    }

    private bindEvents(): void {
        this._obsers.push(
            merge(this.sort.sortChange, this.paginator.page)
                .pipe(
                    tap(() => {
                        this.loadSellingPoints();
                    })
                )
                .subscribe()
        );
    }

    private filterChange(): void {
        let data = this.getFilter();

        this.onFilterChange.emit(data);
    }

    private getFilter(): any {
        return {
            'mb-filter-mode': this.viewFilter.filterMode.value,

            'mb-category-selling-point': this.viewFilter.filterCategory.value,
            'mb-brand-selling-point': this.viewFilter.filterBrand.value,
            'mb-date-selling-point': this.viewFilter.filterDate.value,
            'mb-time-selling-point': [this.viewFilter.filterTimeRange[0].value, this.viewFilter.filterTimeRange[1].value],

            'mb-status-selling-point': this.viewFilter.filterStatus.value,
            'mb-text-selling-point': this.viewFilter.filterText.value,
        };
    }
}
