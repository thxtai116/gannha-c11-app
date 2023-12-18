import { Component, OnInit, ChangeDetectionStrategy, Inject, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatPaginator, MatSort } from '@angular/material';
import { BehaviorSubject, merge, fromEvent } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';

import {
    SellingPointsDataSource,

    SellingPointOverviewViewModel,

    SellingPointModel,
    QueryParamsModel,

    BrandService,

    SellingPointTransformer,

    LanguagePipe,

    Status,
} from '../../../../../../core/core.module';
import { tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';


@Component({
    selector: 'm-single-selling-point-selector',
    templateUrl: './single-selling-point-selector.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SingleSellingPointSelectorComponent implements OnInit {

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild('searchInput', { static: true }) searchInput: ElementRef;

    private _obsers: any[] = [];

    lang: string = "vi";

    viewFilter: any = {
        filterStatus: "2",
        filterBrand: ""
    };

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false)
    }

    viewData: any = {
        displayedColumns: ["Select", "Title", "StartDate", "EndDate", "Status"],
        dataSource: new SellingPointsDataSource(),
        selectedSellingPoint: new SellingPointOverviewViewModel(),
        originSellingPoints: new Array<SellingPointModel[]>(),
        brands$: new BehaviorSubject<any[]>([]),
        sellingPoints$: new BehaviorSubject<SellingPointOverviewViewModel[]>([]),
        sellingPointsResult: new Array<SellingPointOverviewViewModel>(),
        sellingPointsStored: new Array<SellingPointOverviewViewModel>()
    }

    constructor(
        private _brandService: BrandService,
        private _sellingPointTransformer: SellingPointTransformer,
        public dialogRef: MatDialogRef<SingleSellingPointSelectorComponent>,
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

    private parseInjectionData(data: any) {
        this.viewFilter.filterStatus = data.filter['status-selling-point'] || "2";
        this.viewFilter.filterBrand = data.filter['brand-selling-point'] || "";
        this.searchInput.nativeElement.value = data.filter['text-selling-point'] || "";
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    refresh(): void {
        if (!this.viewFilter.filterBrand || this.viewFilter.filterBrand.length === 0)
            return;

        this.viewControl.loading$.next(true);

        Promise.all([
            this._brandService.getSellingPoints(this.viewFilter.filterBrand)
        ]).then(value => {
            this.viewData.originSellingPoints = value[0].filter(x => [Status.Pending, Status.Active].indexOf(x.Status) > -1);

            let vms = this.viewData.originSellingPoints.map(value => {
                return this._sellingPointTransformer.toSellingPointOverview(value);
            });

            this.viewData.sellingPoints$.next(vms);

            this.loadSellingPoints();

            this.viewControl.loading$.next(false);
        }).catch(() => {
            this.viewControl.loading$.next(false);
        });
    }

    onSelectBrand(): void {
        this.viewData.selectedSellingPoint = new SellingPointOverviewViewModel();
        this.refresh();
    }

    onSelectStatus(): void {
        this.loadSellingPoints();
    }

    onCancelClick(): void {
        this.dialogRef.close({
            filter: {
                'status-selling-point': this.viewFilter.filterStatus,
                'brand-selling-point': this.viewFilter.filterBrand,
                'text-selling-point': this.searchInput.nativeElement.value
            }
        });
    }

    onSubmit(): void {
        let model = this.viewData.originSellingPoints.find(x => x.Id === this.viewData.selectedSellingPoint.Id);

        if (model) {
            this.dialogRef.close({
                data: model,
                filter: {
                    'status-selling-point': this.viewFilter.filterStatus,
                    'brand-selling-point': this.viewFilter.filterBrand,
                    'text-selling-point': this.searchInput.nativeElement.value
                }
            })
        }
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
        this.bindDataSource();
        this.bindEvents();

        Promise.all([
            this._brandService.getAllShort()
        ]).then(value => {
            let brands = value[0].map(x => {
                return {
                    id: x.Id,
                    text: new LanguagePipe().transform(x.Name)
                };
            });

            this.viewData.brands$.next(brands);

            this.viewControl.loading$.next(false);

            if (this.viewFilter.filterBrand && this.viewFilter.filterBrand.length > 0) {
                this.refresh();
            }
        }).catch(() => {
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
                        this.loadSellingPoints();
                    })
                )
                .subscribe()
        );
    }
}