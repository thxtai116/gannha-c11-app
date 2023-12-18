import { Component, ChangeDetectionStrategy } from "@angular/core";
import { BrandModel, GlobalState, CommerceCategoryService, CommerceProductService } from '../../../../core/core.module';
import { DiscountsState } from './states';

@Component({
    selector: 'm-discounts',
    templateUrl: 'discounts.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiscountsPage {

    private _obsers: any[] = [];
    private _brand: BrandModel = new BrandModel();

    constructor(
        private _globalState: GlobalState,
        private _discountsState: DiscountsState,
        private _commerceCategoryService: CommerceCategoryService,
        private _commerceProductService: CommerceProductService,
    ) { }

    ngOnInit(): void {
        this.bindSubscribe();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    private init() {
        Promise.all([
            this._commerceCategoryService.getAll(),
            this._commerceProductService.getAll(),
        ]).then(value => {
            this._discountsState.commerceCates$.next(value[0]);
            this._discountsState.commerceProducts$.next(value[1]);
        })
    }

    private bindSubscribe() {
        this._obsers.push(
            this._globalState.brand$.subscribe(value => {
                if (value) {
                    this._brand = value;

                    this._discountsState.brand$.next(this._brand);

                    this.init();
                }
            })
        )
    }
}