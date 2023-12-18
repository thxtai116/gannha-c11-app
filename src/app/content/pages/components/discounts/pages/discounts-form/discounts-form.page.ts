import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import {
    BrandModel,

    SubheaderService,
    DiscountModel,
    SystemAlertService,
    DiscountService,
    MaxCharacters,
    DiscountMaxCharacters,
} from '../../../../../../core/core.module';

import { DiscountsState } from '../../states';
import { Router } from '@angular/router';

@Component({
    selector: 'm-discounts-form',
    templateUrl: 'discounts-form.page.html',
    styleUrls: ['discounts-form.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiscountsFormPage implements OnInit, OnDestroy {

    private _obsers: any[] = [];

    private _readyConditions: Map<string, boolean> = new Map([
        ["Brand", false],
        ["Products", false],
        ["Categories", false],
    ]);

    form: FormGroup;

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false),
        ready: false,
        submitting: false,
        showMaxDiscountAmount: false,
        showMaxDiscountedQuantity: false,
    }

    viewData: any = {
        brand: new BrandModel(),
        categories$: new BehaviorSubject<any[]>([]),
        products$: new BehaviorSubject<any[]>([]),
    }

    descriptionMaxCharacters = DiscountMaxCharacters.MaxDescription;

    constructor(
        private _router: Router,
        private _discountsState: DiscountsState,
        private _discountService: DiscountService,
        private _subheaderService: SubheaderService,
        private _systemAlertService: SystemAlertService,
        private _translate: TranslateService,
        private _changeRef: ChangeDetectorRef,
    ) {
        this.form = this.generateFormGroup();
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

    async save() {
        if (this.viewControl.submitting) {
            return;
        }

        this.viewControl.submitting = true;

        if (this.form.invalid) {
            const controls = this.form.controls;

            Object.keys(controls).forEach(controlName =>
                controls[controlName].markAsTouched()
            );

            this._systemAlertService.error(this._translate.instant("COMMON.ERROR.FORM_INVALID"));

            this.viewControl.submitting = false;

            return;
        }

        this.viewControl.loading$.next(true);

        let discount = this.parseFormToModel(this.form);

        let result = await this._discountService.create(discount);

        this.viewControl.loading$.next(false);

        this.viewControl.submitting = false;

        if (result) {
            this._systemAlertService.success(this._translate.instant("DISCOUNTS.CREATE_SUCCESSFUL"));
            this._router.navigate(["discounts", result[0].Id]);
        }
    }

    private init() {
        if (Array.from(this._readyConditions.values()).filter(x => x === false).length == 0) {
            if (this.viewControl.ready) {
                this._router.navigate(['discounts']);
            } else {
                this.viewControl.ready = true;

                this.bindBreadCrumbs();

                this.viewControl.loading$.next(false);
            }
        }
    }

    private parseFormToModel(form: FormGroup): DiscountModel {
        let disc = new DiscountModel();

        disc.Name = form.get('Name').value;
        disc.DiscountType = form.get('DiscountType').value;
        disc.Description = form.get('Description').value;

        disc.UsePercentage = form.get('DiscountMethod').value == 'percent';

        if (disc.UsePercentage) {
            disc.DiscountPercentage = form.get('DiscountPercentage').value;
        } else {
            disc.DiscountAmount = form.get('DiscountAmount').value;
        }

        disc.MaximumDiscountAmount = form.get('MaximumDiscountAmount').value;
        disc.MaximumDiscountedQuantity = form.get('MaximumDiscountedQuantity').value;

        disc.RequiresCouponCode = form.get('RequiresCouponCode').value;
        if (disc.RequiresCouponCode) {
            disc.CouponCode = form.get('CouponCode').value;
        }

        disc.DiscountLimitation = form.get('DiscountLimitation').value;

        disc.AssignedToEntities = form.get('AssignedToEntities').value;

        disc.StartDate = form.get('FromTo').value[0];
        disc.EndDate = form.get('FromTo').value[1];

        return disc;
    }

    private bindBreadCrumbs() {
        this._subheaderService.setBreadcrumbs([
            { title: "DISCOUNTS.LIST", page: `/discounts` },
            { title: "DISCOUNTS.CREATE", page: `/discounts/create` },
        ])
    }

    private bindSubscribes() {
        this._obsers.push(
            this._discountsState.brand$.subscribe(value => {
                if (value) {
                    this.viewData.brand = value;

                    this._readyConditions.set("Brand", true);

                    this.init();
                }
            })
        );

        this._obsers.push(
            this._discountsState.commerceCates$.subscribe(value => {
                if (value) {
                    this.viewData.categories$.next(value.map(x => {
                        return {
                            id: x.Id,
                            text: x.Name
                        }
                    }));

                    this._readyConditions.set("Categories", true);

                    this.init();
                }
            })
        );

        this._obsers.push(
            this._discountsState.commerceProducts$.subscribe(value => {
                if (value) {
                    this.viewData.products$.next(value.map(x => {
                        return {
                            id: x.Id,
                            text: x.Name
                        }
                    }));

                    this._readyConditions.set("Products", true);

                    this.init();
                }
            })
        );

        // this._obsers.push(
        //     this.form.valueChanges.subscribe(value => {
        //         this.showFormFields(value);
        //     })
        // );

        this._obsers.push(
            this.form.get("DiscountType").valueChanges.subscribe(value => {
                this.setEntitiesValidators(value);
            })
        );

        this._obsers.push(
            this.form.get("DiscountMethod").valueChanges.subscribe(value => {
                this.setDiscountsValidators(value);
            })
        );

        this._obsers.push(
            this._translate.onLangChange.subscribe(() => {
                this.bindBreadCrumbs();
            })
        );
    }

    private showFormFields() {
        // if (value.DiscountType == 2 || value.DiscountType == 5) {
        //     if (value.DiscountMethod == 'percent') {
        //         this.viewControl.showMaxDiscountAmount = true;
        //         this.viewControl.showMaxDiscountedQuantity = true;
        //     } else {
        //         this.viewControl.showMaxDiscountAmount = false;
        //         this.viewControl.showMaxDiscountedQuantity = true;
        //     }
        // } else if (value.DiscountType == 20) {
        //     if (value.DiscountMethod == 'percent') {
        //         this.viewControl.showMaxDiscountAmount = true;
        //         this.viewControl.showMaxDiscountedQuantity = false;
        //     } else {
        //         this.viewControl.showMaxDiscountAmount = false;
        //         this.viewControl.showMaxDiscountedQuantity = false;
        //     }
        // } else {
        //     this.viewControl.showMaxDiscountAmount = false;
        //     this.viewControl.showMaxDiscountedQuantity = false;
        // }

        // let method = this.form.get("DiscountMethod").value;
        // let type = this.form.get("DiscountType").value;

        // this.viewControl.showMaxDiscountAmount = (method == 'percent');
        // this.viewControl.showMaxDiscountedQuantity = (type == 2 || type == 5);

        this._changeRef.detectChanges();
    }

    private setEntitiesValidators(discountType: number) {
        switch (discountType) {
            case 2: {
                this.form.get("AssignedToEntities").setValidators([<any>Validators.required]);
                break;
            };
            case 5: {
                this.form.get("AssignedToEntities").setValidators([<any>Validators.required]);
                break;
            };
            case 20: {
                this.form.get("AssignedToEntities").clearValidators();
                this.form.get("AssignedToEntities").setErrors(null);
                break;
            };
        }

        this._changeRef.detectChanges();
    }

    private setDiscountsValidators(discountMethod: string) {
        switch (discountMethod) {
            case 'percent': {
                this.form.get('DiscountPercentage').setValidators([<any>Validators.required]);
                this.form.get('MaximumDiscountAmount').setValidators([<any>Validators.required]);

                this.form.get('DiscountAmount').clearValidators();
                this.form.get('DiscountAmount').setErrors(null);
                break;
            };
            case 'money': {
                this.form.get('DiscountPercentage').clearValidators();
                this.form.get('DiscountPercentage').setErrors(null);
                this.form.get('MaximumDiscountAmount').clearValidators();
                this.form.get('MaximumDiscountAmount').setErrors(null);

                this.form.get('DiscountAmount').setValidators([<any>Validators.required]);
                break;
            };
        }

        this._changeRef.detectChanges();
    }

    private generateFormGroup(): FormGroup {
        return new FormGroup({
            Name: new FormControl('', [<any>Validators.required]),
            DiscountType: new FormControl(2, [<any>Validators.required]),
            Description: new FormControl('', [<any>MaxCharacters.validate(this.descriptionMaxCharacters)]),

            DiscountMethod: new FormControl('percent', [<any>Validators.required, <any>Validators.min(1)]),
            DiscountAmount: new FormControl(null),
            DiscountPercentage: new FormControl(null),
            MaximumDiscountAmount: new FormControl(null),
            MaximumDiscountedQuantity: new FormControl(null),

            RequiresCouponCode: new FormControl(true),
            CouponCode: new FormControl('', [<any>Validators.required, <any>Validators.min(1)]),

            DiscountLimitation: new FormControl('Unlimited'),

            AssignedToEntities: new FormControl([]),

            FromTo: new FormControl([new Date(), new Date()])
        })
    }
}