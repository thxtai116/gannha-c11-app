import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";

import {
    BrandModel,
    SellingPointModel,

    SellingPointService,
    GlobalState
} from '../../../../../../core/core.module';

import { SellingPointsDetailState, SellingPointsState } from '../../states';

@Component({
    selector: 'm-selling-points-detail',
    templateUrl: './selling-points-detail.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SellingPointsDetailPage implements OnInit, OnDestroy {

    private _obsers: any[] = [];
    private _id: string = "";
    private _brand = new BrandModel();

    private _readyConditions: Map<string, boolean> = new Map([
        ["Brand", false]
    ]);

    ready: boolean = false;

    sp: SellingPointModel = new SellingPointModel();

    constructor(
        private _router: Router,
        private _route: ActivatedRoute,
        private _sellingPointService: SellingPointService,
        private _sellingPointsDetailState: SellingPointsDetailState,
        private _sellingPointsState: SellingPointsState,
        private _globalState: GlobalState,
    ) {
    }

    ngOnInit(): void {
        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }

        this._sellingPointsDetailState.sellingPoint$.next(null);
    }

    private init(): void {
        if (Array.from(this._readyConditions.values()).filter(x => x === false).length === 0) {
            if (this.ready) {
                this._router.navigate(['selling-points']);
            } else {
                this._id = this._route.snapshot.params["id"];

                if (this._id) {
                    Promise.all([
                        this._sellingPointService.get(this._id)
                    ]).then(value => {
                        if (value[0]) {
                            this.sp = value[0];

                            if (this.sp.BrandId !== this._brand.Id) {
                                this._globalState.syncBrand.next(this.sp.BrandId);
                            } else {
                                this.ready = true;

                                this._sellingPointsDetailState.sellingPoint$.next(this.sp);
                            }
                        }
                        else {
                            this._router.navigate(['selling-points']);
                        }
                    });
                }
            }
        }
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this._sellingPointsState.brand$.subscribe(value => {
                if (value) {
                    this._brand = value;

                    this._readyConditions.set("Brand", true);

                    this.init();
                }
            })
        );
    }
}
