import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import { GlobalState } from '../../../../core/core.module';

import { RawUnitsState } from './states';

@Component({
    selector: 'm-raw-units',
    templateUrl: './raw-units.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RawUnitsPage implements OnInit {
    private _obsers: any[] = [];

    constructor(
        private _globalState: GlobalState,
        private _rawUnitsState: RawUnitsState,
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
            this._globalState.brands$.subscribe(value => {
                if (value && value.length > 0) {
                    this._rawUnitsState.brands$.next(value)
                }
            })
        );
    }
}
