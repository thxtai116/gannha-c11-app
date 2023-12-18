import { Component, ChangeDetectionStrategy, OnDestroy, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { CommerceProductsState } from '../../states';

import {
    BrandModel,
    CommerceProductModel,
    CommerceCategoryModel,

    CommerceProductService,
    SubheaderService,
    CommerceCategoryService,
    SystemAlertService,

    CommerceProductType,
} from '../../../../../../core/core.module';

@Component({
    selector: 'm-products-detail',
    templateUrl: 'products-detail.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsDetailPage implements OnInit, OnDestroy {

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
        product: new CommerceProductModel(),
        cats: new Array<CommerceCategoryModel>(),
        filterCats$: new BehaviorSubject<any[]>([]),
    };

    form: FormGroup;

    constructor(
        private _router: Router,
        private _route: ActivatedRoute,
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

        model.Id = this.viewData.product.Id;

        this.viewControl.loading$.next(true);

        Promise.all([
            this._commerceProductService.update(model)
        ]).then(value => {
            if (value[0]) {
                this._systemAlertService.success(this._translate.instant("COMMERCE_PRODUCTS.UPDATE_SUCCESSFUL"));

                this.refresh();
            }
        }).finally(() => {
            this.viewControl.loading$.next(false);
            this.viewControl.submitting = false;
        })
    }

    private refresh(): void {
        let id = this._route.snapshot.params["id"];

        this.viewControl.loading$.next(true);

        Promise.all([
            this._commerceProductService.get(id)
        ]).then(value => {
            this.viewData.cats = value[0];

            this.viewData.product = value[0];

            this.bindBreadcrumbs();
            this.setForm(value[0], this.form);

        }).finally(() => {
            this.viewControl.loading$.next(false);
        });
    }

    private init(): void {
        if (Array.from(this._readyConditions.values()).filter(x => x === false).length === 0) {
            if (this.viewControl.ready) {
                this._router.navigate(['products']);
            } else {
                let id = this._route.snapshot.params["id"];

                if (id) {
                    Promise.all([
                        this._commerceCategoryService.getAll(),
                        this._commerceProductService.get(id)
                    ]).then(value => {
                        this.viewData.cats = value[0];

                        this.viewData.filterCats$.next(value[0].map(x => {
                            return {
                                id: x.Id.toString(),
                                text: x.Name
                            }
                        }));

                        if (value[1] && value[1].Id.toString().length > 0) {
                            this.viewData.product = value[1];

                            this.bindBreadcrumbs();
                            this.setForm(value[1], this.form);

                            this.viewControl.ready = true;
                        } else {
                            this._router.navigate(['products']);
                        }
                    }).finally(() => {
                        this.viewControl.loading$.next(false);
                    });
                }
            }
        }
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "COMMERCE_PRODUCTS.LIST", page: '/products' },
            { title: `${this.viewData.product.Name}`, page: `/products/${this.viewData.product.Id}` }
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

    private setForm(model: CommerceProductModel, form: FormGroup): void {
        form.get("Name").setValue(model.Name);
        form.get("Sku").setValue(model.Sku);

        form.get("ShortDescription").setValue(model.ShortDescription);
        form.get("FullDescription").setValue(model.FullDescription);

        form.get("Published").setValue(model.Published);
        form.get("MarkAsNew").setValue(model.MarkAsNew);

        form.get("Price").setValue(model.Price);
        form.get("OldPrice").setValue(model.OldPrice);

        form.get("Categories").setValue(model.Categories.map(x => x.toString()));
        form.get("Picture").setValue(model.Picture);

        form.get("ProductType").setValue(model.ProductType.toString());
        form.get("DisplayOrder").setValue(model.DisplayOrder);
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
            MarkAsNew: new FormControl(false, [<any>Validators.required]),
            Published: new FormControl(false, [<any>Validators.required]),
        });
    }
}