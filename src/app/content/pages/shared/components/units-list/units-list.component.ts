import { Component, OnInit, Input, ViewChild, ElementRef, Output, EventEmitter, forwardRef, ChangeDetectionStrategy, AfterViewInit } from '@angular/core';
import { MatDialog, MatPaginator, MatSort } from '@angular/material';
import { BehaviorSubject, merge, fromEvent } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

import { UnitsSelectorComponent } from '../../../shared/components/units-selector/units-selector.component';

import {
    UnitTransformer,
    UnitOverviewViewModel,
    UnitsDataSource,
    QueryParamsModel,
    BrandService
} from '../../../../../core/core.module';
import { SelectionPreviewComponent } from '../selection-preview/selection-preview.component';

@Component({
    selector: 'm-units-list',
    templateUrl: './units-list.component.html',
    styleUrls: ['./units-list.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => UnitsListComponent),
            multi: true,
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnitsListComponent implements OnInit, AfterViewInit, ControlValueAccessor {

    @Input()
    set unitIds(value) {
        this._unitIds$.next(value);
    };

    get unitIds() {
        return this._unitIds$.getValue();
    }

    @Input()
    set brandId(value) {
        this._brandId$.next(value);
    };

    get brandId() {
        return this._brandId$.getValue();
    }

    @Input() readonly: boolean = true;

    @Output() onChange: EventEmitter<string[]> = new EventEmitter();

    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: false }) sort: MatSort;
    @ViewChild('searchInput', { static: true }) searchInput: ElementRef;

    private propagateChange = (value: any) => { };

    private _unitIds$: BehaviorSubject<string[]> = new BehaviorSubject([]);

    private _brandId$: BehaviorSubject<string> = new BehaviorSubject("");

    private _obsers: any[] = [];

    private _filter: any = {
        'brand': "",
        'status': "",
        'province': "",
        'text': "",
    }

    lang: string = "vi";

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false)
    }

    viewFilter: any = {
        filterStatus: "",
    };

    viewData: any = {
        displayedColumnsEditMode: ["Select", "Index", "Name", "Address", "Status", "Actions"],
        displayedColumns: ["Index", "Name", "Status"],
        dataSource: new UnitsDataSource(),
        selection: new SelectionModel<UnitOverviewViewModel>(true, []),
        units$: new BehaviorSubject<UnitOverviewViewModel[]>([]),
        brandUnits: new Array<UnitOverviewViewModel>(),
        unitsResult: new Array<UnitOverviewViewModel>(),
        unitsStored: new Array<UnitOverviewViewModel>(),
    }

    constructor(
        private _unitTransformer: UnitTransformer,
        public dialog: MatDialog,
        private _brandService: BrandService,
    ) {
    }

    ngOnInit() {
        this.viewControl.loading$.next(true);

        this.bindSubscribes();

        this._brandId$.subscribe(x => {
            if (x.length > 0) {
                this.init();
            }
        });
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    writeValue(obj: any): void {
        if (obj && obj.length > 0) {
            this.loadResources(obj, this.brandId);
        }
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void { }

    setDisabledState?(isDisabled: boolean): void { }

    ngAfterViewInit() {
        this.bindEvents();
    }

    add(): void {
        let units = this.viewData.units$.getValue();

        const data: any = {
            units,
            brand: this.brandId,
            filter: this._filter,
        }

        const dialogRef = this.dialog.open(UnitsSelectorComponent, { data: data, disableClose: true });

        let sub = dialogRef.afterClosed().subscribe(res => {
            this._filter = res.filter;
            if (res.data && res.data.length > 0) {
                this.viewControl.loading$.next(true);

                if (units.length > 0) {
                    res.data.push(...units.filter(x => !res.data.includes(x.Id)).map(x => x.Id));
                }

                this.loadResources(res.data, this.brandId);

                this.onChange.emit(res.data);

                this.propagateChange(res.data);
            }

            sub.unsubscribe();
        });
    }

    removeAll() {
        let units = this.viewData.units$.getValue();

        for (let unit of this.viewData.selection.selected) {
            let index = units.findIndex(x => x.Id === unit.Id);

            if (index > -1) {
                units.splice(index, 1);
            }
        }

        let data = units.map(x => x.Id);

        this.loadResources(data, this.brandId);

        this.onChange.emit(data);

        this.propagateChange(data);

        this.viewData.selection.clear();
    }

    remove(id: string): void {
        let units = this.viewData.units$.getValue();
        let index = units.findIndex(x => x.Id === id);

        if (index > -1) {
            units.splice(index, 1);

            let data = units.map(x => x.Id);

            this.loadResources(data, this.brandId);

            this.onChange.emit(data);

            this.propagateChange(data);
        }
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

    private filterConfiguration(): any {
        const filter: any = {};

        const searchText: string = this.searchInput.nativeElement.value;

        if (this.viewFilter.filterStatus && this.viewFilter.filterStatus.length > 0) {
            filter.Status = this.viewFilter.filterStatus;
        }

        filter.Name = searchText;

        return filter;
    }

    private async init() {
        this.loadResources(this.unitIds, this.brandId);
        this.bindDataSource();
    }

    private async loadResources(ids: string[], brandId: string) {
        this.viewControl.loading$.next(true);

        if (!brandId || brandId.length === 0) {
            this.viewControl.loading$.next(false);

            return;
        }

        let result = await this._brandService.getUnits(brandId);

        if (result.length > 0) {
            let vm = result.filter(x => ids.includes(x.Id)).map(x => this._unitTransformer.toUnitOverView(x));

            this.viewData.units$.next(vm);
        }

        this.viewControl.loading$.next(false);
    }

    private bindDataSource(): void {
        const queryParams = new QueryParamsModel(this.filterConfiguration());
        this.viewData.dataSource.init(this.viewData.units$, queryParams);
    }

    private bindSubscribes(): void {
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
