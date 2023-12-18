import { Component, OnInit } from '@angular/core';
import { GlobalState } from '../../../../core/core.module';
import { AccountState } from './states';

@Component({
    selector: 'm-account',
    templateUrl: './account.component.html'
})
export class AccountComponent implements OnInit {

    private _obsers: any[] = [];

    constructor(
        private _accountState: AccountState,
        private _globalState: GlobalState
    ) { }

    ngOnInit() {
        if (this._globalState.userInfoSub$.getValue()) {
            this._accountState.profile$.next(this._globalState.userInfoSub$.getValue());
        }

        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this._globalState.userInfoSub$.subscribe(value => {
                if (value) {
                    this._accountState.profile$.next(value);
                }
            })
        );
    }

}
