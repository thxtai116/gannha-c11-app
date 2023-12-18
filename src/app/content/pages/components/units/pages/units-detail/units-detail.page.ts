import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import {
    UnitModel,

    UnitService,
    BrandModel,

    GlobalState,
} from '../../../../../../core/core.module';

import { UnitsDetailState, UnitsState } from '../../states';

@Component({
    selector: 'm-units-detail',
    templateUrl: './units-detail.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnitsDetailPage implements OnInit {

    private _obsers: any[] = [];
    private _id: string = "";
    private _brand = new BrandModel();

    private _readyConditions: Map<string, boolean> = new Map([
        ["Brand", false]
    ]);

    ready: boolean = false;

    unit: UnitModel = new UnitModel();

    constructor(
        private _router: Router,
        private _route: ActivatedRoute,
        private _unitService: UnitService,
        private _unitsDetailState: UnitsDetailState,
        private _unitsState: UnitsState,
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

        this._unitsDetailState.unit$.next(null);
    }

    private init(): void {
        if (Array.from(this._readyConditions.values()).filter(x => x === false).length === 0) {
            if (this.ready) {
                this._router.navigate(['units']);
            } else {
                this._id = this._route.snapshot.params["id"];

                if (this._id) {
                    Promise.all([
                        this._unitService.get(this._id)
                    ]).then(value => {
                        if (value[0]) {
                            this.unit = value[0];

                            if (this.unit.BrandId !== this._brand.Id) {
                                this._globalState.syncBrand.next(this.unit.BrandId);
                            } else {
                                this.ready = true;

                                this._unitsDetailState.unit$.next(this.unit);
                            }
                        } else {
                            this._router.navigate(['units']);
                        }
                    });
                }
            }
        }
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this._unitsState.brand$.subscribe(value => {
                if (value) {
                    this._brand = value;

                    this._readyConditions.set("Brand", true);

                    this.init();
                }
            })
        );
    }
}
