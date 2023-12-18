import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import {
    GnServiceConnectionModel,

    CommerceProductService,
    CommerceProductModel
} from '../../../../../../../core/core.module';

@Component({
    selector: 'm-order-service-content',
    templateUrl: './order-service-content.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderServiceContentComponent implements OnInit {
    @Input() service$: BehaviorSubject<GnServiceConnectionModel> = new BehaviorSubject<GnServiceConnectionModel>(null);

    private _obsers: any[] = [];

    lang: string = "vi";

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(true),
        ready: false
    }

    viewData: any = {
        model: new GnServiceConnectionModel(),
        products: new Array<CommerceProductModel[]>(),
        selectedProducts: new Array<CommerceProductModel[]>()
    }

    constructor(
        private _commerceProductService: CommerceProductService
    ) {
    }

    ngOnInit(): void {
        this.init();

        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    private init() {
        this.viewControl.loading$.next(true);

        Promise.all([
            this._commerceProductService.getAll()
        ]).then(value => {
            this.viewData.products = value[0];

            this.viewControl.ready = true;

            this.parseModel(this.viewData.model);
        }).finally(() => {
            this.viewControl.loading$.next(false);
        });
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this.service$.subscribe(value => {
                if (value) {
                    this.viewData.model = value;

                    if (this.viewControl.ready) {
                        this.parseModel(value);
                    }
                }
            })
        );
    }

    private parseModel(model: GnServiceConnectionModel): void {
        if (model.Parameters.Query && model.Parameters.Query.length > 0 && model.Parameters.Query[0] != '&') {
            model.Parameters.Query = `&${model.Parameters.Query}`;
        }
        let products = model.Parameters.Query.split('&').filter(x => x.length > 0).map(x => {
            let productQuery = x.split('productId=').filter(y => y.length > 0);

            if (productQuery.length > 0)
                return productQuery[0];

        });

        this.viewData.selectedProducts = this.viewData.products.filter(x => products.indexOf(x.Id.toString()) > -1);
    }

}
