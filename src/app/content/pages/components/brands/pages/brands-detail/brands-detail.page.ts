import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from "@angular/router";

import {
    BrandService,

    MenuItemModel,
} from "../../../../../../core/core.module";

import {
    BrandModel
} from "../../../../../../core/core.module";

import { BrandsDetailState } from "../../states/index";

@Component({
    selector: 'm-brands-detail',
    templateUrl: './brands-detail.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrandsDetailPage implements OnInit {

    private _obsers: any[] = [];
    private _id: string = "";
    private _brandModel: BrandModel = new BrandModel();

    menu: MenuItemModel[] = [];

    constructor(
        private _route: ActivatedRoute,
        private _brandService: BrandService,
        private _brandsDetailState: BrandsDetailState,
        private _changeRef: ChangeDetectorRef,
    ) {
    }

    ngOnInit(): void {
        this.menu = this._brandsDetailState.menu$.getValue();

        this._id = this._route.snapshot.params["id"];

        if (this._id) {
            Promise.all([
                this._brandService.get(this._id),         
            ]).then(value => {
                this._brandModel = value[0];
                this._brandsDetailState.brand$.next(this._brandModel);
            });
        }

        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }

        this._brandsDetailState.brand$.next(new BrandModel());
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this._brandsDetailState.menu$.subscribe(value => {
                this.menu = value;

                this._changeRef.detectChanges();
            })
        );
    }
}
