import { Component, OnInit } from '@angular/core';

import { BrandModel, GlobalState } from '../../../../core/core.module';

import { RecruitmentsState } from './states';

@Component({
    selector: 'm-recruitments',
    templateUrl: './recruitments.page.html'
})
export class RecruitmentsPage implements OnInit {

    private _obsers: any[] = [];
    private _brand: BrandModel = new BrandModel();

    constructor(
        private _globalState: GlobalState,
        private _recruitmentsState: RecruitmentsState,
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
                    this._brand == value;

                    this._recruitmentsState.brand$.next(value);
                }
            })
        )
    }
}
