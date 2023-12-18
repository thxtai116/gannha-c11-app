import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from "@angular/core";
import { DiscountModel, MenuItemModel, GlobalState, DiscountService, BrandModel } from '../../../../../../core/core.module';
import { Router, ActivatedRoute } from '@angular/router';
import { DiscountsState, DiscountsDetailState } from '../../states';

@Component({
    selector: 'm-discounts-detail',
    templateUrl: 'discounts-detail.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiscountsDetailPage {

    private _obsers: any[] = [];
    private _id: string = "";
    private _brand = new BrandModel();

    private _readyConditions: Map<string, boolean> = new Map([
        ["Brand", false]
    ]);

    ready: boolean = false;

    discount: DiscountModel = new DiscountModel();

    menu: MenuItemModel[] = [];

    constructor(
        private _router: Router,
        private _route: ActivatedRoute,
        private _discountsDetailState: DiscountsDetailState,
        private _discountsState: DiscountsState,
        private _discountService: DiscountService,
        private _changeRef: ChangeDetectorRef,
    ) {
    }

    ngOnInit(): void {
        this.menu = this._discountsDetailState.menu$.getValue();

        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }

        this._discountsDetailState.discount$.next(null);
    }

    private init(): void {
        if (Array.from(this._readyConditions.values()).filter(x => x === false).length === 0) {
            if (this.ready) {
                this._router.navigate(['discounts']);
            } else {
                this._id = this._route.snapshot.params["id"];

                if (this._id) {
                    Promise.all([
                        this._discountService.getById(this._id),
                    ]).then(value => {
                        if (value[0] && value[0].Id.toString().length > 0) {
                            this.discount = value[0];
                            this.ready = true;
                            this._discountsDetailState.discount$.next(this.discount);
                        } else {
                            this._router.navigate(['discounts']);
                        }
                    });
                }
            }
        }
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this._discountsState.brand$.subscribe(value => {
                if (value) {
                    this._brand = value;

                    this._readyConditions.set("Brand", true);

                    this.init();
                }
            })
        );

        this._obsers.push(
            this._discountsDetailState.menu$.subscribe(value => {
                if (value) {
                    this.menu = value;

                    this._changeRef.detectChanges();
                }
            })
        )
    }
}