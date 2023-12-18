import { Component, ChangeDetectionStrategy, OnDestroy, OnInit } from "@angular/core";
import {
    BrandModel,
    GlobalState,
    BrandService,
    UnitModel,
} from '../../../../core/core.module';

import { OrdersState } from './states';

@Component({
    selector: 'm-orders',
    templateUrl: 'orders.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersPage implements OnInit, OnDestroy {

    private _obsers: any[] = [];
    private _brand: BrandModel = new BrandModel();
    private _units: UnitModel[] = [];

    constructor(
        private _globalState: GlobalState,
        private _orderState: OrdersState,
        private _brandService: BrandService,
    ) { }

    ngOnInit(): void {
        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    private getUnits(brand: BrandModel) {
        Promise.all([
            this._brandService.getUnits(brand.Id)
        ]).then(value => {
            this._units = value[0];

            this._orderState.units$.next(this._units);
        });
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this._globalState.brand$.subscribe(value => {
                if (value) {
                    this._brand = value;

                    this._orderState.brand$.next(this._brand);
                }
            })
        );

        this._obsers.push(
            this._orderState.brand$.subscribe(value => {
                if (value){
                    this.getUnits(value);
                }
            })
        );
    }
}