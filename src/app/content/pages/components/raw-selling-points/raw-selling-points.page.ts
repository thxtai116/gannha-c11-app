import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import { FacebookPageService } from '../../../../core/core.module';

import { RawSellingPointsState } from './states';

@Component({
    selector: 'm-raw-selling-points',
    templateUrl: './raw-selling-points.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RawSellingPointsPage implements OnInit {

    public config: any;

    constructor(
        private _facebookPageService: FacebookPageService,
        private _rawSellingPointsState: RawSellingPointsState
    ) {
    }

    ngOnInit(): void {
        this.init();
    }

    private init(): void {
        Promise.all([
            this._facebookPageService.getList()
        ]).then(value => {
            this._rawSellingPointsState.pages$.next(value[0]);
        })
    }
}
