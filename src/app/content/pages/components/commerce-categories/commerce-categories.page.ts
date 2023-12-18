import { Component, ChangeDetectionStrategy, OnDestroy, OnInit } from "@angular/core";

import {
    BrandModel,

    GlobalState,

    BrandService,
    SystemAlertService
} from '../../../../core/core.module';

import { CommerceCategoriesState } from './states';

@Component({
    selector: 'm-commerce-categories',
    templateUrl: 'commerce-categories.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommerceCategoriesPage implements OnInit, OnDestroy {

    private _obsers: any[] = [];
    private _brand: BrandModel = new BrandModel();

    constructor(
        private _globalState: GlobalState,
        private _commerceCategoriesState: CommerceCategoriesState,
        private _brandService: BrandService,
        private _systemAlertService: SystemAlertService
    ) { }

    ngOnInit(): void {
        this.bindSubscribe();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    private init(id: string) {
        Promise.all([
            this._brandService.switchBrand(id),
            this._brandService.get(id)
        ]).then(value => {
            if (!!value[0]) {
                this._brand = value[1];

                this._commerceCategoriesState.brand$.next(value[1]);
            } else {
                this._systemAlertService.error("Lỗi khi thay đổi Brand");
            }
        })
    }

    private bindSubscribe() {
        this._obsers.push(
            this._globalState.brand$.subscribe(value => {
                if (value && value.Id !== this._brand.Id) {
                    this.init(value.Id);
                }
            })
        )
    }
}