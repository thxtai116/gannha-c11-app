import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { BrandModel, GlobalState } from '../../../../core/core.module';

import { RecruitersState } from './states';

@Component({
    selector: 'm-recruiters',
    templateUrl: './recruiters.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecruitersPage implements OnInit {
    private _obsers: any[] = [];
    private _brand: BrandModel = new BrandModel();

    constructor(
        private _globalState: GlobalState,
        private _recruitersState: RecruitersState,
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

                    this._recruitersState.brand$.next(value);
                }
            })
        )
    }
}
