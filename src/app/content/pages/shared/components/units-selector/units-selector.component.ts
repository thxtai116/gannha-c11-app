import { Component, OnInit, ChangeDetectionStrategy, ElementRef, ViewChild, Inject } from '@angular/core';
import { MatDialogRef, MatPaginator, MatSort, MAT_DIALOG_DATA, MatDialog } from '@angular/material';

import {
    BrandService,

    QueryParamsModel,

    UnitsDataSource,

    UnitOverviewViewModel,

    UnitTransformer,
    LanguagePipe,
    AreaService
} from '../../../../../core/core.module';

import { SelectionModel } from '@angular/cdk/collections';

import { fromEvent, merge, BehaviorSubject } from 'rxjs';

import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { SelectionPreviewComponent } from '../selection-preview/selection-preview.component';

@Component({
    selector: 'm-units-selector',
    templateUrl: './units-selector.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnitsSelectorComponent implements OnInit {

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild('searchInput', { static: true }) searchInput: ElementRef;

    private _obsers: any[] = [];

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false)
    }

    viewFilter: any = {
        filterStatus: "2",
        filterBrand: "",
        filterProvince: "",
    };

    viewData: any = {
        displayedColumns: ["Select", "Index", "Name", "Address", "Status"],
        dataSource: new UnitsDataSource(),
        selection: new SelectionModel<UnitOverviewViewModel>(true, []),
        initialUnits: new Array<UnitOverviewViewModel>(),
        brands$: new BehaviorSubject<any[]>([]),
        provinces$: new BehaviorSubject<any[]>([]),
        units$: new BehaviorSubject<UnitOverviewViewModel[]>([]),
        unitsResult: new Array<UnitOverviewViewModel>(),
        unitsStored: new Array<UnitOverviewViewModel>()
    }

    constructor(
        private _brandService: BrandService,
        private _areaService: AreaService,
        private _unitTransformer: UnitTransformer,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<UnitsSelectorComponent>,
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
        this.viewData.initialUnits = data['units'] || [];
        this.viewData.initialBrand = data['brand'] || "";

        this.viewFilter.filterBrand = data.filter['brand'] || "";
        this.viewFilter.filterStatus = data.filter['status'] || "2";
        this.viewFilter.filterProvince = data.filter['province'] || "";
        this.searchInput.nativeElement.value = data.filter['text'] || "";
    }

    loadUnits(): void {
        const queryParams = new QueryParamsModel(
            this.filterConfiguration(),
            this.sort.direction,
            this.sort.active,
            this.paginator.pageIndex,
            this.paginator.pageSize
        );

        this.viewData.dataSource.load(this.viewData.unitsStored, queryParams);
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

    onSelectBrand(): void {
        this.viewData.selection.clear();
        this.viewControl.loading$.next(true);

        Promise.all([
            this._brandService.getUnits(this.viewFilter.filterBrand)
        ]).then(value => {
            let vms = value[0].filter(x => this.viewData.initialUnits.filter(y => y.Id === x.Id).length === 0).map(x => this._unitTransformer.toUnitOverView(x));

            this.viewData.units$.next(vms);

            this.viewControl.loading$.next(false);
        }).catch(() => {
            this.viewControl.loading$.next(false);
        });
    }

    onSelectStatus(): void {
        this.loadUnits();
    }

    onSelectProvince(): void {
        this.loadUnits();
    }

    onCancelClick(): void {
        this.dialogRef.close({
            filter: {
                'brand': this.viewFilter.filterBrand,
                'status': this.viewFilter.filterStatus,
                'province': this.viewFilter.filterProvince,
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
                'brand': this.viewFilter.filterBrand,
                'status': this.viewFilter.filterStatus,
                'province': this.viewFilter.filterProvince,
                'text': this.searchInput.nativeElement.value
            }
        });
    }

    private init(): void {
        this.bindDataSource();
        this.bindEvents();

        Promise.all([
            this._brandService.getAllShort(),
            this._areaService.getProvinces(),
        ]).then(value => {
            let vms = value[0].map(x => {
                return {
                    id: x.Id,
                    text: new LanguagePipe().transform(x.Name)
                }
            });

            if (this.viewData.initialBrand.length > 0) {
                this.viewData.brands$.next(vms.filter(x => x.id == this.viewData.initialBrand));
                this.viewFilter.filterBrand = this.viewData.initialBrand;
            } else {
                this.viewData.brands$.next(vms);
            }

            if (this.viewFilter.filterBrand && this.viewFilter.filterBrand.length > 0) {
                this.onSelectBrand();
            }

            let provs: any[] = [
                {
                    id: "",
                    text: "All"
                }
            ]

            value[1].forEach(x => {
                provs.push({
                    id: x.Id,
                    text: x.Name["vi"]
                })
            });

            this.viewData.provinces$.next(provs);

            this.viewControl.loading$.next(false);
        }).catch(() => {
            this.viewControl.loading$.next(false);
        });
    }

    private filterConfiguration(): any {
        const filter: any = {};

        const searchText: string = this.searchInput.nativeElement.value;

        if (this.viewFilter.filterStatus && this.viewFilter.filterStatus.length > 0) {
            filter.Status = this.viewFilter.filterStatus;
        }
        if (this.viewFilter.filterProvince && this.viewFilter.filterProvince.length > 0) {
            filter.Province = this.viewFilter.filterProvince;
        }

        filter.filterGroup = {
            Name: searchText,
            Address: searchText
        }

        return filter;
    }

    private bindDataSource(): void {
        const queryParams = new QueryParamsModel(this.filterConfiguration());

        this.viewData.dataSource.init(this.viewData.units$, queryParams);
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0))
        );

        this._obsers.push(
            this.viewData.dataSource.entitySubject.subscribe(res => {
                this.viewData.unitsResult = res;
            })
        );

        this._obsers.push(
            this.viewData.units$.subscribe(res => {
                this.viewData.unitsStored = res;
            })
        );
    }

    private bindEvents(): void {
        this._obsers.push(
            merge(this.sort.sortChange, this.paginator.page)
                .pipe(
                    tap(() => {
                        this.loadUnits();
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
                        this.loadUnits();
                    })
                )
                .subscribe()
        );
    }
}
