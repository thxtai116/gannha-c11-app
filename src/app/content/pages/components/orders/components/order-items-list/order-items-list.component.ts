import { Component, ChangeDetectionStrategy, OnInit, Input, } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { OrderModel, OrderItemModel } from '../../../../../../core/core.module';

@Component({
    selector: 'm-order-items-list',
    templateUrl: 'order-items-list.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,

})
export class OrderItemsListComponent implements OnInit {

    @Input()
    get order() {
        return this._order$.getValue();
    }
    set order(value) {
        this._order$.next(value);
    }

    private _obsers: any[] = [];

    private _order$: BehaviorSubject<OrderModel> = new BehaviorSubject<OrderModel>(null);

    viewData: any = {
        orderItemsSubTotal: 0,
        orderItemsDiscount: 0
    }

    constructor(
    ) { }

    ngOnInit(): void {
        this.bindSubscribe();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    private bindSubscribe() {
        this._obsers.push(
            this._order$.subscribe(value => {
                if (value) {
                    this.calculateReceipt(this.order.OrderItems);
                }
            })
        );
    }

    private calculateReceipt(items: OrderItemModel[]) {
        this.viewData.orderItemsSubTotal = 0;
        this.viewData.orderItemsDiscount = 0;

        items.forEach(item => {
            this.viewData.orderItemsSubTotal += item.UnitPrice * item.Quantity;
            this.viewData.orderItemsDiscount += item.DiscountAmount;
        });
    }
}