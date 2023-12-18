import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import {
    CategoryService,
    UtilityService,

    GlobalState,

    BrandModel,
    MenuItemModel,

    CategoryUtility
} from '../../../../core/core.module';

import { BrandState } from './states';
import { MenuService } from './services';

@Component({
    selector: 'm-brand',
    templateUrl: './brand.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrandPage implements OnInit {

    private _obsers: any[] = [];
    private _brand: BrandModel = new BrandModel();

    menu: MenuItemModel[] = [];

    constructor(
        private _brandState: BrandState,
        private _categoryService: CategoryService,
        private _utilityService: UtilityService,
        private _menuService: MenuService,
        private _categoryUtil: CategoryUtility,
        private _globalState: GlobalState,
    ) {
    }

    ngOnInit(): void {
        this.menu = this._menuService.getBrandsDetailMenu();
        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }

        this._brandState.brand$.next(new BrandModel());
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this._globalState.brand$.subscribe(value => {
                if (value) {
                    this._brand = value;

                    this._brandState.brand$.next(this._brand);

                    this.init();
                }
            })
        );
    }

    private init(): void {
        Promise.all([
            this._categoryService.getAll(),
            this._utilityService.getAll(),
        ]).then(value => {
            this._brandState.categogies$.next(value[0]);

            this._brandState.utilities$.next(value[1]);

            this._brandState.subCategories$.next(this._categoryUtil.getSubCategories(value[0]));
        });
    }
}
