import { Component, ChangeDetectionStrategy, Input, ViewChild, forwardRef, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core'
import { MatSort, MatPaginator } from '@angular/material';
import { BehaviorSubject, merge } from 'rxjs';
import { QueryParamsModel, OrderNoteModel, OrderNotesDataSource } from '../../../../../core/core.module';
import { tap } from 'rxjs/operators';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
    selector: 'm-order-notes-list',
    templateUrl: 'order-notes-list.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => OrderNotesListComponent),
            multi: true,
        }
    ]
})
export class OrderNotesListComponent implements OnInit, OnDestroy, AfterViewInit, ControlValueAccessor {

    @Input() readonly: boolean = false;
    @Input() loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: false }) sort: MatSort;

    private _obsers: any[] = [];
    private _onChangeCallback = (value: any) => { };

    viewData: any = {
        displayedColumns: ["Index", "CreatedAt", "Note", "DisplayToCustomer"],
        displayedColumnsEditmode: ["Index", "CreatedAt", "Note", "DisplayToCustomer", "Actions"],
        dataSource: new OrderNotesDataSource(),
        orderNotes$: new BehaviorSubject<OrderNoteModel[]>([]),
        orderNotesResult: new Array<OrderNoteModel>(),
        orderNotesStored: new Array<OrderNoteModel>(),
    }

    constructor(
        private _changeRef: ChangeDetectorRef,
    ) { }

    ngOnInit(): void {
        this._changeRef.detectChanges();
        this.bindSubscribe();
    }

    ngAfterViewInit(): void {
        this.bindEvents();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    writeValue(obj: any[]): void {
        if (obj) {
            this.viewData.orderNotes$.next(obj);
        }

        this.init();
    }

    registerOnChange(fn: any): void {
        this._onChangeCallback = fn;
    }

    registerOnTouched(fn: any): void { }

    setDisabledState?(isDisabled: boolean): void { }

    loadorderNotes(): void {
        const queryParams = new QueryParamsModel(
            this.filterConfiguration(),
            this.sort.direction,
            this.sort.active,
            this.paginator.pageIndex,
            this.paginator.pageSize
        );

        this.viewData.dataSource.load(this.viewData.orderNotesStored, queryParams);
    }

    private filterConfiguration(): any {
        const filter: any = {};

        return filter;
    }

    private init() {
        this.bindDataSource();
    }

    private bindDataSource(): void {
        const queryParams = new QueryParamsModel(this.filterConfiguration());
        this.viewData.dataSource.init(this.viewData.orderNotes$, queryParams);
    }

    private bindSubscribe() {
        this._obsers.push(
            this.viewData.dataSource.entitySubject.subscribe(value => {
                this.viewData.orderNotesResult = value;
            })
        )

        this._obsers.push(
            this.viewData.orderNotes$.subscribe(value => {
                this.viewData.orderNotesStored = value;
            })
        );
    }

    private bindEvents(): void {
        this._obsers.push(
            merge(this.sort.sortChange, this.paginator.page)
                .pipe(
                    tap(() => {
                        this.loadorderNotes();
                    })
                )
                .subscribe()
        );
    }
}