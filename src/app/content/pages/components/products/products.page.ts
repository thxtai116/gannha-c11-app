import { Component, ChangeDetectionStrategy, OnDestroy, OnInit } from "@angular/core";

import { CommerceProductsState } from './states';

import {
    BrandModel,

    GlobalState,
} from '../../../../core/core.module';

@Component({
    selector: 'm-products',
    templateUrl: 'products.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsPage implements OnInit, OnDestroy {

    private _obsers: any[] = [];
    private _brand: BrandModel = new BrandModel();

    constructor(
        private _globalState: GlobalState,
        private _commerceProductsState: CommerceProductsState
    ) { }

    ngOnInit(): void {
        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this._globalState.brand$.subscribe(value => {
                if (value) {
                    this._brand = value;

                    this._commerceProductsState.brand$.next(this._brand);
                }
            })
        );
    }
}