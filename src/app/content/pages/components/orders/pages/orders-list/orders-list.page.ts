import { Component, ChangeDetectionStrategy, OnInit, ViewChild, ElementRef } from "@angular/core";
import { MatPaginator, MatSort } from '@angular/material';

import { BehaviorSubject, merge, fromEvent } from 'rxjs';
import { tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { TranslateService } from '@ngx-translate/core';

import { OrdersState } from '../../states';

import {
    BrandModel,
    UnitModel,
    OrderModel,

    OrderViewModel,
    QueryParamsModel,

    SubheaderService,
    OrderService,
    FilterStorageService,
    BrandService,

    OrdersDataSource,

    OrderTransformer,

    LanguagePipe,
    MomentToDatePipe,

    DateTimeUtility,
} from '../../../../../../core/core.module';

import { FormControl, FormGroup } from '@angular/forms';

@Component({
    selector: 'm-orders-list',
    templateUrl: 'orders-list.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrdersListPage implements OnInit {

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

    private _obsers: any[] = [];
    private _filter: any = {};

    private _readyConditions: Map<string, boolean> = new Map([
        ["Brand", false],
        ["Units", false],
    ]);

    viewControl: any = {
        ready: false,
        loading$: new BehaviorSubject<boolean>(false),
        showMap: false,
    };

    viewData: any = {
        brand: new BrandModel(),
        units: new Array<UnitModel>(),
        displayedColumns: [
            "Id",
            "Index",
            "OrderStatus",
            "OrderTotal",
            "CreatedAt",
            "Customer",
        ],
        dataSource: new OrdersDataSource(this._orderService),
        units$: new BehaviorSubject<any[]>([]),
        orders$: new BehaviorSubject<OrderViewModel[]>([]),
        orders: new Array<OrderModel>(),
        ordersResult: new Array<OrderViewModel[]>([]),
        orderDetail: null,
    };

    ordersLocations: FormControl = new FormControl();

    form: FormGroup;

    constructor(
        private _ordersState: OrdersState,
        private _brandServce: BrandService,
        private _subheaderService: SubheaderService,
        private _orderService: OrderService,
        private _filterStorageService: FilterStorageService,
        private _translate: TranslateService,
        private _orderTransformer: OrderTransformer,
        private _dateUtil: DateTimeUtility,
    ) {
        this.form = this.generateForm();
    }

    ngOnInit(): void {
        this.bindSubscribes();
    }

    showMap(): void {
        this.viewControl.showMap = true;
    }

    hideMap(): void {
        this.viewControl.showMap = false;
    }

    refresh(): void {
        this.viewControl.loading$.next(true);

        Promise.all([
            this.loadOrders(),
        ]).finally(() => {
            this.viewControl.loading$.next(false);
        });
    }

    detail(id: string): void {
        this.viewControl.loading$.next(true);

        this._orderService.getDetails(id).then(res => {
            this.viewData.orderDetail = res;
        }).finally(() => this.viewControl.loading$.next(false));
    }

    private init(): void {
        if (Array.from(this._readyConditions.values()).filter(x => x === false).length === 0) {
            if (this.viewControl.ready) return;

            this.viewControl.ready = true;

            this.bindBreadcrumbs();

            this._brandServce.getUnits(this.viewData.brand.Id).then(res => {
                if (res) {
                    this.viewData.units = res;

                    let vms = res.map(x => {
                        return {
                            id: x.Id,
                            text: new LanguagePipe().transform(x.Name)
                        }
                    });

                    this.viewData.units$.next(vms);
                }

                this.initFilter();

                if ((!this._filter['unitId'] || this._filter['unitId'].length === 0) && this.viewData.units$.getValue().length > 0) {
                    this.ctrlUnit.setValue(this.viewData.units$.getValue()[0].id);
                }
            });
        }
    }

    private updateMap() {
        this.ordersLocations.setValue({
            Units: this.viewData.units,
            Orders: this.viewData.orders
        })
    }

    private loadOrders(): void {
        const queryParams = new QueryParamsModel(
            this._filter,
            'asc',
            '',
            this.paginator.pageIndex + 1,
            this.paginator.pageSize
        );

        this.viewData.dataSource.load(queryParams);
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "ORDERS.LIST", page: `/orders` }
        ]);
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this.form.valueChanges.pipe(
                debounceTime(250),
                distinctUntilChanged()
            ).subscribe(() => {
                this.saveFilter();

                this.paginator.pageIndex = 0;

                this.refresh();
            })
        );

        merge(this.paginator.page)
            .pipe(
                tap(() => {
                    this.saveFilter();

                    this.refresh();
                })
            )
            .subscribe();

        this._obsers.push(
            this._ordersState.brand$.subscribe(value => {
                if (value) {
                    this.viewData.brand = value;

                    this._readyConditions.set("Brand", true);

                    this.init();
                }
            })
        );

        this._obsers.push(
            this._ordersState.units$.subscribe(value => {
                if (value && value.length > 0) {
                    this.viewData.units.push(...value);

                    this._readyConditions.set("Units", true);

                    this.init();
                }
            })
        );

        this._obsers.push(
            this.viewData.dataSource.entitySubject.subscribe(res => {
                if (res) {
                    this.viewData.ordersResult = res.map(x => this._orderTransformer.toOrderOverview(x));
                    this.viewData.orders = res;

                    this.updateMap();
                }
            })
        );

        this._obsers.push(
            this._translate.onLangChange.subscribe(() => {
                this.bindBreadcrumbs();
            })
        );
    }

    private saveFilter() {
        this._filter['fromDate'] = this._dateUtil.convertDateToOnlyDateString(new MomentToDatePipe().transform(this.ctrlDateRanges.value['startDate']));
        this._filter['toDate'] = this._dateUtil.convertDateToOnlyDateString(new MomentToDatePipe().transform(this.ctrlDateRanges.value['endDate']));
        this._filter['id'] = this.ctrlText.value;
        this._filter['status'] = this.ctrlStatus.value;
        this._filter['unitId'] = this.ctrlUnit.value;

        this._filterStorageService.set(OrdersListPage.name, this._filter);
    }

    private initFilter() {
        this._filter = this._filterStorageService.get(OrdersListPage.name);

        if (this._filter) {
            if (this._filter['fromDate'] && this._filter['toDate']) {
                this.ctrlDateRanges.setValue({
                    startDate: new Date(this._filter['fromDate']),
                    endDate: new Date(this._filter['toDate'])
                });
            }

            if (this._filter['unitId']) {
                this.ctrlUnit.setValue(this._filter['unitId']);
            }
        } else {
            this._filter = {
                fromDate: this._dateUtil.convertDateToOnlyDateString(new Date()),
                toDate: this._dateUtil.convertDateToOnlyDateString(new Date()),
            };
        }
    }

    private generateForm(): FormGroup {
        return new FormGroup({
            DateRanges: new FormControl({
                startDate: new Date(),
                endDate: new Date()
            }),
            Unit: new FormControl(""),
            Status: new FormControl(""),
            Text: new FormControl("")
        });
    }

    //#region Form

    get ctrlDateRanges() {
        return this.form.get("DateRanges");
    }

    get ctrlUnit() {
        return this.form.get("Unit");
    }

    get ctrlStatus() {
        return this.form.get("Status");
    }

    get ctrlText() {
        return this.form.get("Text");
    }

    //#endregion
}