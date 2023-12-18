import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { RawUnitsState } from '../../states';

@Component({
    selector: 'm-verification-requests-details',
    templateUrl: 'verification-requests-details.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class VerificationRequestsDetailsPage implements OnInit {

    private _obsers: any[] = [];
    private _id: string = "";
    private _brands: any[] = [];

    constructor(
        private _route: ActivatedRoute,
        private _rawUnitsState: RawUnitsState,
    ) {
    }

    ngOnInit(): void {
        this._id = this._route.snapshot.params["id"];

        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
        this._rawUnitsState.brand$.next(undefined);
    }

    private init(): void {
        if (this._id) {
            let brand = this._brands.find(brand => brand.Id == this._id);

            this._rawUnitsState.brand$.next(brand);
        }
    }

    private bindSubscribes() {
        this._obsers.push(
            this._rawUnitsState.brands$.subscribe(brands => {
                if (brands && brands.length > 0) {
                    this._brands = brands;

                    this.init();
                }
            })
        )
    }
}
