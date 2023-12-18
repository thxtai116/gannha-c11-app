import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import {
    BrandModel,
    RecruitmentModel,
    MenuItemModel,

    RecruitmentService,
    BrandService,

    GlobalState,
} from '../../../../../../core/core.module';

import { RecruitmentsDetailState, RecruitmentsState } from '../../states';

@Component({
    selector: 'm-recruitments-detail',
    templateUrl: './recruitments-detail.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecruitmentsDetailPage implements OnInit {

    private _obsers: any[] = [];
    private _id: string = "";
    private _brand: BrandModel = new BrandModel();
    private _recruitment: RecruitmentModel = new RecruitmentModel();

    private _readyConditions: Map<string, boolean> = new Map([
        ["Brand", false]
    ]);

    menu: MenuItemModel[] = [];
    ready: boolean = false;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _recruitmentService: RecruitmentService,
        private _brandService: BrandService,
        private _globalState: GlobalState,
        private _recruitmentsDetailState: RecruitmentsDetailState,
        private _recruitmentsState: RecruitmentsState,
    ) { }

    ngOnInit() {
        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }

        this._recruitmentsDetailState.recruitment$.next(null);
    }

    private init(): void {
        if (Array.from(this._readyConditions.values()).filter(x => x === false).length === 0) {
            if (this.ready) {
                this._router.navigate(['recruitments']);
            } else {
                this._id = this._route.snapshot.params["id"];

                if (this._id) {
                    Promise.all([
                        this._recruitmentService.get(this._id),
                        this._brandService.getUnits(this._brand.Id)
                    ]).then(value => {
                        if (value[0]) {
                            this._recruitment = value[0];

                            if (this._recruitment.BrandId !== this._brand.Id) {
                                this._globalState.syncBrand.next(this._recruitment.BrandId);
                            } else {
                                this.ready = true;

                                this._recruitmentsDetailState.units$.next(value[1]);
                                this._recruitmentsDetailState.recruitment$.next(this._recruitment);
                            }
                        } else {
                            this._router.navigate(['recruitments']);
                        }
                    });
                }
            }
        }
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this._recruitmentsDetailState.menu$.subscribe(value => {
                if (value) {
                    this.menu = value;
                }
            })
        );

        this._obsers.push(
            this._recruitmentsState.brand$.subscribe(value => {
                if (value) {
                    this._brand = value;

                    this._readyConditions.set("Brand", true);

                    this.init();
                }
            })
        )
    }
}
