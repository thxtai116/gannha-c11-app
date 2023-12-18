import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef } from "@angular/core";
import { Router, ActivatedRoute } from '@angular/router';

import {
    BrandModel,
    OrderModel,
    MenuItemModel,

    OrderService,

    GlobalState
} from '../../../../../../core/core.module';

import { OrdersDetailState, OrdersState } from '../../states';

@Component({
    selector: 'm-orders-detail',
    templateUrl: 'orders-detail.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersDetailPage implements OnInit {

    private _obsers: any[] = [];
    private _id: string = "";
    private _brand = new BrandModel();

    private _readyConditions: Map<string, boolean> = new Map([
        ["Brand", false]
    ]);

    ready: boolean = false;

    order: OrderModel = new OrderModel();

    menu: MenuItemModel[] = [];

    constructor(
        private _router: Router,
        private _route: ActivatedRoute,
        private _ordersDetailState: OrdersDetailState,
        private _ordersState: OrdersState,
        private _globalState: GlobalState,
        private _orderService: OrderService,
        private _changeRef: ChangeDetectorRef,
    ) {
    }

    ngOnInit(): void {
        this.menu = this._ordersDetailState.menu$.getValue();

        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }

        this._ordersDetailState.order$.next(null);
    }

    private init(): void {
        if (Array.from(this._readyConditions.values()).filter(x => x === false).length === 0) {
            if (this.ready) {
                this._router.navigate(['orders']);
            } else {
                this._id = this._route.snapshot.params["id"];

                if (this._id) {
                    Promise.all([
                        this._orderService.getDetails(this._id),
                    ]).then(value => {
                        if (value[0] && value[0].Id.toString().length > 0) {
                            this.order = value[0];

                            if (this.order.BrandId !== this._brand.Id) {
                                this._globalState.syncBrand.next(this.order.BrandId);
                            } else {
                                this.ready = true;

                                this._ordersDetailState.order$.next(this.order);
                            }
                        } else {
                            this._router.navigate(['orders']);
                        }
                    });
                }
            }
        }
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this._ordersState.brand$.subscribe(value => {
                if (value) {
                    this._brand = value;

                    this._readyConditions.set("Brand", true);

                    this.init();
                }
            })
        );

        this._obsers.push(
            this._ordersDetailState.menu$.subscribe(value => {
                if (value) {
                    this.menu = value;

                    this._changeRef.detectChanges();
                }
            })
        )
    }
}