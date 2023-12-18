import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ViewChildren, QueryList } from "@angular/core";
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

import {
    OrderModel,

    SubheaderService,
    OrderService,
    SystemAlertService,
    ConfirmService,

    GoogleMapsApiUtility
} from '../../../../../../core/core.module';

import { OrdersDetailState, OrdersState } from '../../states';

import { MenuService } from '../../services';

import { MarkerModel } from '../../../../shared/shared.module';

@Component({
    selector: 'm-orders-basic-info',
    templateUrl: 'orders-basic-info.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrdersBasicInfoPage implements OnInit, OnDestroy {
    private _obsers: any[] = [];
    private _readyConditions: Map<string, boolean> = new Map([
        ["Order", false],
        ["Units", false]
    ]);

    lang: string = "vi";

    viewControl: any = {
        editMode: true,
        ready: false,
        loading$: new BehaviorSubject<boolean>(false)
    }

    viewData: any = {
        order: new OrderModel(),
        units: new Array<any>(),
        markers: new Array<MarkerModel>(),
        nearlyUnit: {}
    }

    form: FormGroup;
    formStatus: FormGroup;

    constructor(
        private _ordersState: OrdersState,
        private _ordersDetailState: OrdersDetailState,
        private _subheaderService: SubheaderService,
        private _orderService: OrderService,
        private _translate: TranslateService,
        private _systemAlertService: SystemAlertService,
        private _confirmService: ConfirmService,
        private _menuService: MenuService,
        private _googleMapUtil: GoogleMapsApiUtility,
    ) {
        this.form = this.generateForm();

        this.formStatus = new FormGroup({
            Status: new FormControl('', [<any>Validators.required])
        });
    }

    ngOnInit(): void {
        this.viewControl.loading$.next(true);

        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    async updateOrderStatus(status: number) {
        let des = `${this._translate.instant("ORDERS.CONFIRM_UPDATE_STATUS")}: <b>${this.getStatusName(status)}</b>`

        let confirm = await this._confirmService.show(this._translate.instant('COMMON.CONFIRMATION'), des, true);

        let sub = confirm.afterClosed().subscribe(async res => {
            if (res) {
                this.viewControl.loading$.next(true);

                let result = await this._orderService.updateOrderStatus(this.viewData.order.Id, status);

                if (result) {
                    this._systemAlertService.success(this._translate.instant("ORDERS.UPDATE_STATUS_SUCCESSFUL"));

                    this.reload();
                }

                this.viewControl.loading$.next(false);
            }
        });

        this._obsers.push(sub);
    }

    private reload() {
        Promise.all([
            this._orderService.getDetails(this.viewData.order.Id)
        ]).then(value => {
            let order = value[0];

            this.viewControl.ready = false;

            this._ordersDetailState.order$.next(order);
        }).catch(() => {
            this.viewControl.loading$.next(false);
        })
    }

    private init(): void {
        if (Array.from(this._readyConditions.values()).filter(x => x === false).length === 0) {
            if (this.viewControl.ready)
                return;

            this.viewControl.ready = true;

            this._ordersDetailState.menu$.next(this._menuService.getOrdersDetailMenu(this.viewData.order.Id));

            this.bindBreadcrumbs();

            this.parseToFormGroup(JSON.parse(JSON.stringify(this.viewData.order)));

            this.updateMap();

            let unit = this.viewData.units.find(x => x.Id === this.viewData.order.UnitId);

            if (unit)
                this.viewData.nearlyUnit = unit;

            if (!this.viewData.order.PickupInStore && unit) {
                this.viewData.order.DeliveryRadius = this._googleMapUtil.calculateDistance(
                    { Latitude: this.viewData.order.Shipping.Latitude, Longitude: this.viewData.order.Shipping.Longitude },
                    { Latitude: unit.Latitude, Longitude: unit.Longitude });
            }

            this.viewControl.loading$.next(false);
        }
    }

    private updateMap() {
        if (!this.viewData.order.PickupInStore) {
            let order = this.viewData.order as OrderModel;
            let marker = new MarkerModel();

            marker.Latitude = order.Shipping.Latitude;
            marker.Longitude = order.Shipping.Longitude;
            marker.Description = order.Shipping.Address;

            this.viewData.markers = [marker];
        }
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "ORDERS.LIST", page: `/orders` },
            { title: `${this.viewData.order.Id}`, page: `/orders/${this.viewData.order.Id}` },
            { title: "ORDERS.BASIC_INFO", page: `/orders/${this.viewData.order.Id}/basic-info` }
        ]);
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this._ordersDetailState.order$.subscribe(value => {
                if (value) {
                    this.viewData.order = value;

                    this._readyConditions.set("Order", true);

                    this.init();
                }
            })
        );

        this._obsers.push(
            this._ordersState.units$.subscribe(value => {
                if (value && value.length > 0) {
                    this.viewData.units = value;

                    this._readyConditions.set("Units", true);

                    this.init();
                }
            })
        );

        this._obsers.push(
            this._translate.onLangChange.subscribe(() => {
                if (this._readyConditions.get("Order")) {
                    this.bindBreadcrumbs();
                }
            })
        );
    }

    private parseToFormGroup(order: OrderModel) {
        this.form.get('OrderId').setValue(order.Id);
        this.form.get('CreatedAt').setValue(order.CreatedAt);
        this.form.get('OrderStatus').setValue(order.OrderStatus);

        this.form.get('Unit').setValue(order.UnitName["vi"]);
        this.form.get('Customer').setValue(`${order.Customer.FullName} (${order.Customer.PhoneNumber})`);
    }

    private generateForm(): FormGroup {
        return new FormGroup({
            OrderId: new FormControl({ value: '', disabled: true }, [<any>Validators.required]),
            CreatedAt: new FormControl({ value: new Date(), disabled: true }),
            OrderStatus: new FormControl(10),

            Unit: new FormControl({ value: '', disabled: true }),
            Customer: new FormControl({ value: '', disabled: true }),
        });
    }

    private getStatusName(status: number = 0): string {
        let name = "N/A";

        switch (status) {
            case 10:
                name = this._translate.instant("ORDERS.STATUSES.PENDING");
                break;

            case 20:
                name = this._translate.instant("ORDERS.STATUSES.PROCESSING");
                break;

            case 30:
                name = this._translate.instant("ORDERS.STATUSES.COMPLETE");
                break;

            case 40:
                name = this._translate.instant("ORDERS.STATUSES.CANCELLED");
                break;
        }

        return name;
    }
}