import { Component, OnInit, ChangeDetectionStrategy, forwardRef, Inject } from '@angular/core';
import { NG_VALUE_ACCESSOR, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { OrderServiceModel } from '../../models';
import {
    SystemAlertService,
    CommerceProductService,
    CommerceProductModel,
    LanguagePipe
} from '../../../../../../../core/core.module';

@Component({
    selector: 'm-order-service',
    templateUrl: './order-service.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => OrderServiceComponent)
        }
    ],
})

export class OrderServiceComponent implements OnInit {
    model: OrderServiceModel = new OrderServiceModel();

    form: FormGroup;

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false)
    }

    viewData: any = {
        products: new Array<CommerceProductModel>(),
        filterProducts$: new BehaviorSubject<any[]>([]),
    }

    lang: string = "vi";

    constructor(
        private _systemAlertService: SystemAlertService,
        private _translate: TranslateService,
        private _commerceProductService: CommerceProductService,
        public dialogRef: MatDialogRef<OrderServiceComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.form = this.generateForm();
    }

    ngOnInit(): void {
        if (this.data && this.data.model) {
            this.setForm(this.data.model);
        }

        this.init();
    }

    onCancelClick(): void {
        this.dialogRef.close();
    }

    onSubmit(): void {
        const controls = this.form.controls;

        Object.keys(controls).forEach(controlName =>
            controls[controlName].markAsTouched()
        );

        if (!this.form.valid) {
            this._systemAlertService.error(this._translate.instant("COMMON.ERROR.FORM_INVALID"));

            return;
        }

        let model = this.parseForm();

        this.dialogRef.close({
            data: model
        });
    }

    private init() {
        this.viewControl.loading$.next(true);

        Promise.all([
            this._commerceProductService.getAll()
        ]).then(value => {
            this.viewData.products = value[0];

            this.viewData.filterProducts$.next(value[0].map(x => {
                return {
                    id: x.Id.toString(),
                    text: x.Name
                }
            }));
        }).finally(() => {
            this.viewControl.loading$.next(false);
        });
    }

    private generateForm(): FormGroup {
        return new FormGroup({
            Title: new FormControl('', [<any>Validators.required]),
            Products: new FormControl([]),
            AddFeatureToCart: new FormControl(false),
            ReceiveBy: new FormControl([], [<any>Validators.required])
        });
    }

    private parseForm(): OrderServiceModel {
        let model = new OrderServiceModel();

        model.Title[this.lang] = this.ctrlTitle.value;
        model.Query = this.ctrlProducts.value.map(x => `&productId=${x}`).join('');
        model.AddFeatureToCart = this.ctrlAddFeatureToCart.value;
        model.ReceiveBy = this.ctrlReceiveBy.value.join(',');

        return model;
    }

    private setForm(model: OrderServiceModel): void {
        let products = model.Query.split('&').filter(x => x.length > 0).map(x => {
            let productQuery = x.split('productId=').filter(y => y.length > 0);

            if (productQuery.length > 0)
                return productQuery[0];

        });

        this.ctrlTitle.setValue(new LanguagePipe().transform(model.Title));
        this.ctrlProducts.setValue(products);
        this.ctrlAddFeatureToCart.setValue(model.AddFeatureToCart);
        this.ctrlReceiveBy.setValue(model.ReceiveBy ? model.ReceiveBy.split(',') : []);
    }

    //#region Form

    get ctrlTitle() { return this.form.get("Title"); }

    get ctrlProducts() { return this.form.get("Products"); }

    get ctrlAddFeatureToCart() { return this.form.get("AddFeatureToCart"); }

    get ctrlReceiveBy() { return this.form.get("ReceiveBy"); }

    //#endregion
}
