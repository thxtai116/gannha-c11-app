import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ElementRef, Output, EventEmitter, Input } from '@angular/core';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';

import { BehaviorSubject, merge, fromEvent } from 'rxjs';
import { tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import {
    SellingPointsDataSource,

    SellingPointOverviewViewModel,

    BrandService,

    SellingPointTransformer,

    SellingPointModel,
    QueryParamsModel,
    LanguagePipe,
} from '../../../../../../../core/core.module';

import { SellingPointFilterType } from '../../consts';

import { SelectionPreviewComponent, SellingPointTimelineComponent } from '../../../../components';

@Component({
    selector: 'm-single-brand-selling-points-selector',
    templateUrl: './single-brand-selling-points-selector.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SingleBrandSellingPointsSelectorComponent implements OnInit {
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild('searchInput', { static: true }) searchInput: ElementRef;

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
        filterStatus: "",
        filterBrand: ""
    };

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(true),
        mode: SellingPointFilterType.SINGLE_BRAND
    }

    viewData: any = {
        displayedColumns: ["Select", "Index", "Title", "StartDate", "EndDate", "Picture", "Status"],
        dataSource: new SellingPointsDataSource(),
        currentSelection: new SelectionModel<SellingPointOverviewViewModel>(true, []),
        globalSelection: new Array<any>(),
        initialSellingPoints: new Array<string>(),
        originSellingPoints: new Array<SellingPointModel[]>(),
        brands$: new BehaviorSubject<any[]>([]),
        sellingPoints$: new BehaviorSubject<SellingPointOverviewViewModel[]>([]),
        sellingPointsResult: new Array<SellingPointOverviewViewModel>(),
        sellingPointsStored: new Array<SellingPointOverviewViewModel>()
    }

    constructor(
        private _brandService: BrandService,
        private _sellingPointTransformer: SellingPointTransformer,
        public dialog: MatDialog,
    ) {
    }

    ngOnInit(): void {
        this.bindDataSource();
        this.bindEvents();

        this.init();

        this.bindSubscribes();
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
        let data = this.viewData.globalSelection.map(x => this._sellingPointTransformer.toSellingPointOverview(x))

        this.dialog.open(SellingPointTimelineComponent, { data: data, disableClose: true });
    }

    onClearSelection(): void {
        this.viewData.globalSelection = [];
        this.viewData.currentSelection.clear();

        this.onSelectedSellingPointsChange();
    }

    refresh(): void {
        this.viewControl.loading$.next(true);

        Promise.all([
            this._brandService.getSellingPoints(this.viewFilter.filterBrand)
        ]).then(value => {
            this.viewData.originSellingPoints = value[0].filter(x => this.viewData.initialSellingPoints.indexOf(x.Id) === -1);

            let vms = this.viewData.originSellingPoints.map(value => {
                return this._sellingPointTransformer.toSellingPointOverview(value);
            });

            this.viewData.sellingPoints$.next(vms);

            this.loadSellingPoints();

            this.viewControl.loading$.next(false);
        }).finally(() => {
            this.updateCurrentSelection(this.viewData.globalSelection)
            this.viewControl.loading$.next(false);
        });
    }

    onStatusSelect(): void {
        this.filterChange()
        this.loadSellingPoints();
    }

    onBrandSelect(): void {
        this.filterChange();
        this.refresh();
    }

    loadSellingPoints(): void {
        const queryParams = new QueryParamsModel(
            this.filterConfiguration(),
            this.sort.direction,
            this.sort.active,
            this.paginator.pageIndex,
            this.paginator.pageSize
        );

        this.viewData.dataSource.load(this.viewData.sellingPointsStored, queryParams);
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

    private parseInjectionData(data: any) {
        this.viewData.initialSellingPoints = data.selected || [];

        this.viewFilter.filterStatus = data.filter['status-selling-point'] || "";
        this.viewFilter.filterBrand = data.filter['brand-selling-point'] || "";
        this.searchInput.nativeElement.value = data.filter['text-selling-point'] || "";
    }

    private filterConfiguration(): any {
        const filter: any = {};

        const searchText: string = this.searchInput.nativeElement.value;

        if (this.viewFilter.filterStatus && this.viewFilter.filterStatus.length > 0) {
            filter.Status = this.viewFilter.filterStatus;
        }

        filter.Title = searchText;

        return filter;
    }

    private init(): void {
        Promise.all([
            this._brandService.getAllShort()
        ]).then(value => {
            let brands = value[0].map(x => {
                return {
                    id: x.Id,
                    text: new LanguagePipe().transform(x.Name)
                };
            });

            if (!this.viewFilter.filterBrand && this.data.filter['brand-selling-point']) {
                this.viewFilter.filterBrand = this.data.filter['brand-selling-point'];
            }

            this.viewData.brands$.next(brands);

            if (this.viewFilter.filterBrand && this.viewFilter.filterBrand.length > 0) {
                this.refresh();
            }
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
            this._data$.subscribe(value => {
                if (value) {
                    this.parseInjectionData(value);

                    if (this.viewFilter.filterBrand.length > 0) {
                        this.refresh();
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

        this._obsers.push(
            fromEvent(this.searchInput.nativeElement, 'keyup')
                .pipe(
                    debounceTime(150),
                    distinctUntilChanged(),
                    tap(() => {
                        this.filterChange();
                        this.loadSellingPoints();
                    })
                )
                .subscribe()
        );
    }

    private getFilter(): any {
        return {
            'status-selling-point': this.viewFilter.filterStatus,
            'brand-selling-point': this.viewFilter.filterBrand,
            'text-selling-point': this.searchInput.nativeElement.value
        };
    }

    private filterChange(): void {
        let data = this.getFilter();

        this.onFilterChange.emit(data);
    }
}
