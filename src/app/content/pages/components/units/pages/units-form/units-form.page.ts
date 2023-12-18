import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import {
    BrandModel,
} from '../../../../../../core/core.module';

import { UnitsState } from '../../states';

@Component({
    selector: 'm-units-form',
    templateUrl: './units-form.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnitsFormPage implements OnInit {

    private _obsers: any[] = [];

    private _brand: BrandModel = new BrandModel();

    constructor(
        private _unitsState: UnitsState
    ) {
    }

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
            this._unitsState.brand$.subscribe(value => {
                if (value && value.Id !== this._brand.Id) {
                    this._brand = JSON.parse(JSON.stringify(value));
                }
            })
        );
    }
}
