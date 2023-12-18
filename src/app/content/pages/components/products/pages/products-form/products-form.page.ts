import { Component, ChangeDetectionStrategy, OnDestroy, OnInit } from "@angular/core";
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';

import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { CommerceProductsState } from '../../states';

import {
    BrandModel,
    CommerceProductModel,

    CommerceProductService,
    SubheaderService,
    CommerceCategoryService,
    CommerceCategoryModel,

    CommerceProductType,
    SystemAlertService,
} from '../../../../../../core/core.module';

@Component({
    selector: 'm-products-form',
    templateUrl: 'products-form.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsFormPage implements OnInit, OnDestroy {
    private _obsers: any[] = [];

    private _readyConditions: Map<string, boolean> = new Map([
        ["Brand", false]
    ]);

    viewControl: any = {
        ready: false,
        loading$: new BehaviorSubject<boolean>(false),
        submitting: false,
    };

    viewData: any = {
        brand: new BrandModel(),
        cats: new Array<CommerceCategoryModel>(),
        filterCats$: new BehaviorSubject<any[]>([]),
    };

    form: FormGroup;

    constructor(
        private _router: Router,
        private _commerceProductsState: CommerceProductsState,
        private _commerceProductService: CommerceProductService,
        private _commerceCategoryService: CommerceCategoryService,
        private _subheaderService: SubheaderService,
        private _systemAlertService: SystemAlertService,
        private _translate: TranslateService,

    ) {
        this.form = this.generateForm();
    }

    ngOnInit(): void {
        this.viewControl.loading$.next(true);

        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    save(): void {
        if (this.viewControl.submitting)
            return;

        const controls = this.form.controls;

        if (this.form.invalid) {
            Object.keys(controls).forEach(controlName =>
                controls[controlName].markAsTouched()
            );

            this._systemAlertService.error(this._translate.instant("COMMON.ERROR.FORM_INVALID"));

            return;
        }

        this.viewControl.submitting = true;

        let model = this.parseForm(this.form);

        this.viewControl.loading$.next(true);

        Promise.all([
            this._commerceProductService.create(model)
        ]).then(value => {
            if (value[0] && value[0].length > 0) {
                this._systemAlertService.success(this._translate.instant("COMMERCE_PRODUCTS.CREATE_SUCCESSFUL"));

                this._router.navigate(["/products", value[0][0].Id]);
            }
        }).finally(() => {
            this.viewControl.loading$.next(false);
            this.viewControl.submitting = false;
        })
    }

    private init(): void {
        if (Array.from(this._readyConditions.values()).filter(x => x === false).length === 0) {
            if (this.viewControl.ready) {
                this._router.navigate(['products']);
            } else {
                this.viewControl.ready = true;

                this.bindBreadcrumbs();

                Promise.all([
                    this._commerceCategoryService.getAll()
                ]).then(value => {
                    this.viewData.cats = value[0];

                    this.viewData.filterCats$.next(value[0].map(x => {
                        return {
                            id: x.Id,
                            text: x.Name
                        }
                    }));
                }).finally(() => {
                    this.viewControl.loading$.next(false);
                });
            }
        }
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "COMMERCE_PRODUCTS.LIST", page: '/products' },
            { title: "COMMERCE_PRODUCTS.CREATE", page: '/products/create' }
        ]);
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this._commerceProductsState.brand$.subscribe(value => {
                if (value) {
                    this.viewData.brand = value;

                    this._readyConditions.set("Brand", true);

                    this.init();
                }
            })
        )
    }

    private parseForm(form: FormGroup): CommerceProductModel {
        let model = new CommerceProductModel();

        model.Name = form.get("Name").value;
        model.Sku = form.get("Sku").value;

        model.ShortDescription = form.get("ShortDescription").value;
        model.FullDescription = form.get("FullDescription").value;

        model.Published = form.get("Published").value;
        model.MarkAsNew = form.get("MarkAsNew").value;

        model.Price = form.get("Price").value;
        model.OldPrice = form.get("OldPrice").value;

        model.Categories = form.get("Categories").value;
        model.Picture = form.get("Picture").value;

        model.ProductType = form.get("ProductType").value;
        model.DisplayOrder = form.get("DisplayOrder").value;

        return model;
    }

    private generateForm(): FormGroup {
        return new FormGroup({
            Name: new FormControl("", [<any>Validators.required, <any>Validators.minLength(3)]),
            Sku: new FormControl("", [<any>Validators.required, <any>Validators.minLength(3)]),
            Categories: new FormControl([], [<any>Validators.required]),
            ShortDescription: new FormControl(""),
            FullDescription: new FormControl(""),
            Price: new FormControl(1, [<any>Validators.required, <any>Validators.min(1)]),
            OldPrice: new FormControl(0),
            Picture: new FormControl(""),
            ProductType: new FormControl(CommerceProductType.Single.toString(), [<any>Validators.required]),
            DisplayOrder: new FormControl(1, [<any>Validators.required, <any>Validators.min(1)]),
            MarkAsNew: new FormControl(true, [<any>Validators.required]),
            Published: new FormControl(true, [<any>Validators.required]),
        });
    }
}