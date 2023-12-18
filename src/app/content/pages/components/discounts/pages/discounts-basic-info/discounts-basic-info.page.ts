import { Component, ChangeDetectionStrategy } from "@angular/core";
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { BrandModel, DiscountModel, DiscountService, SubheaderService, SystemAlertService, MaxCharacters, DiscountMaxCharacters } from '../../../../../../core/core.module';
import { DiscountsState, DiscountsDetailState } from '../../states';

@Component({
    selector: 'm-discounts-basic-info',
    templateUrl: 'discounts-basic-info.page.html',
    styleUrls: ['discounts-basic-info.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiscountsBasicInfoPage {

    private _obsers: any[] = [];

    private _readyConditions: Map<string, boolean> = new Map([
        ["Brand", false],
        ["Discount", false],
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
        discount: new DiscountModel(),
        categories$: new BehaviorSubject<any[]>([]),
        products$: new BehaviorSubject<any[]>([]),
        filteredEntities: [],
    }

    descriptionMaxCharacters = DiscountMaxCharacters.MaxDescription;

    constructor(
        private _router: Router,
        private _discountsState: DiscountsState,
        private _discountsDetailState: DiscountsDetailState,
        private _discountService: DiscountService,
        private _subheaderService: SubheaderService,
        private _systemAlertService: SystemAlertService,
        private _translate: TranslateService,
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

        if (this.form.get('Name').invalid || this.form.get('Description').invalid) {

            this.form.get('Name').markAsTouched();
            this.form.get('Description').markAsTouched();

            this._systemAlertService.error(this._translate.instant("COMMON.ERROR.FORM_INVALID"));

            this.viewControl.submitting = false;

            return;
        }

        this.viewControl.loading$.next(true);

        let discount = this.parseFormToModel(this.form);

        let result = await this._discountService.update(discount);

        this.viewControl.loading$.next(false);

        this.viewControl.submitting = false;

        if (result) {
            this._systemAlertService.success(this._translate.instant("DISCOUNTS.UPDATE_SUCCESSFUL"));
        }
    }

    private init() {
        if (Array.from(this._readyConditions.values()).filter(x => x === false).length == 0) {
            if (this.viewControl.ready) {
                this._router.navigate(['discounts']);
            } else {
                this.viewControl.ready = true;

                this.bindBreadCrumbs();

                this.parseModelToForm(this.viewData.discount);

                this.viewControl.loading$.next(false);
            }
        }
    }

    private parseFormToModel(form: FormGroup): DiscountModel {
        let disc = new DiscountModel();

        disc.Id = this.viewData.discount.Id;
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

    private parseModelToForm(discount: DiscountModel) {
        this.form.get('Name').setValue(discount.Name);
        this.form.get('DiscountType').setValue(discount.DiscountType);
        this.form.get('Description').setValue(discount.Description);

        this.form.get('DiscountAmount').setValue(discount.DiscountAmount);
        this.form.get('DiscountPercentage').setValue(discount.DiscountPercentage);
        this.form.get('MaximumDiscountAmount').setValue(discount.MaximumDiscountAmount);
        this.form.get('MaximumDiscountedQuantity').setValue(discount.MaximumDiscountedQuantity);

        this.form.get('RequiresCouponCode').setValue(true);
        this.form.get('CouponCode').setValue(discount.CouponCode);

        this.form.get('DiscountLimitation').setValue('Unlimited');

        this.form.get('AssignedToEntities').setValue(discount.AssignedToEntities);

        this.form.get('FromTo').setValue([discount.StartDate, discount.EndDate]);

        this.form.get('DiscountMethod').setValue(discount.UsePercentage ? "percent" : "money");

        this.form.get('Status').setValue(discount.Status);
        this.form.get('CreatedAt').setValue(discount.CreatedAt);
    }

    private bindBreadCrumbs() {
        this._subheaderService.setBreadcrumbs([
            { title: "DISCOUNTS.LIST", page: `/discounts` },
            { title: this.viewData.discount.Name, page: `/discounts/${this.viewData.discount.Id}` }
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
            this._translate.onLangChange.subscribe(() => {
                if (this._readyConditions.get("Discount")) {
                    this.bindBreadCrumbs();
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

        this._obsers.push(
            this._discountsDetailState.discount$.subscribe(value => {
                if (value) {
                    this.viewData.discount = value;
                    this._readyConditions.set("Discount", true);
                    this.init();
                }
            })
        );

        this._obsers.push(
            this.form.valueChanges.subscribe(() => {
                this.showFormFields(this.form);
            })
        );

        this._obsers.push(
            this.form.get("AssignedToEntities").valueChanges.subscribe(value => {
                this.viewData.filteredEntities = [];

                switch (this.form.get("DiscountType").value) {
                    case 2: {
                        value.forEach(item => {
                            this.viewData.filteredEntities.push(this.viewData.products$.getValue().find(prod => prod.id == item))
                        })
                        break;
                    }
                    case 5: {
                        value.forEach(item => {
                            this.viewData.filteredEntities.push(this.viewData.categories$.getValue().find(prod => prod.id == item))
                        })
                        break;
                    }
                    case 20: {
                        break;
                    }
                }
            })
        );
    }

    private showFormFields(value: any) {
        if (value.get('DiscountType').value == 2 || value.get('DiscountType').value == 5) {
            if (value.get('DiscountMethod').value == 'percent') {
                this.viewControl.showMaxDiscountAmount = value.get('MaximumDiscountAmount').value;
                this.viewControl.showMaxDiscountedQuantity = value.get('MaximumDiscountedQuantity').value;
            } else {
                this.viewControl.showMaxDiscountAmount = false;
                this.viewControl.showMaxDiscountedQuantity = value.get('MaximumDiscountedQuantity').value;
            }
        } else if (value.get('DiscountType').value == 20) {
            if (value.get('DiscountMethod').value == 'percent') {
                this.viewControl.showMaxDiscountAmount = value.get('MaximumDiscountAmount').value;
                this.viewControl.showMaxDiscountedQuantity = false;
            } else {
                this.viewControl.showMaxDiscountAmount = false;
                this.viewControl.showMaxDiscountedQuantity = false;
            }
        } else {
            this.viewControl.showMaxDiscountAmount = false;
            this.viewControl.showMaxDiscountedQuantity = false;
        }
    }

    private generateFormGroup(): FormGroup {
        return new FormGroup({
            Name: new FormControl('', [<any>Validators.required]),
            DiscountType: new FormControl({ value: 0, disabled: true }, [<any>Validators.required]),
            Description: new FormControl('', [<any>MaxCharacters.validate(this.descriptionMaxCharacters)]),

            DiscountMethod: new FormControl({ value: "", disabled: true }),
            DiscountAmount: new FormControl({ value: 0, disabled: true }),
            DiscountPercentage: new FormControl({ value: 0, disabled: true }),
            MaximumDiscountAmount: new FormControl({ value: 0, disabled: true }),
            MaximumDiscountedQuantity: new FormControl({ value: 0, disabled: true }),

            RequiresCouponCode: new FormControl(true),
            CouponCode: new FormControl({ value: '', disabled: true }, [<any>Validators.required]),

            DiscountLimitation: new FormControl('Unlimited'),

            AssignedToEntities: new FormControl({ value: [], disabled: true }),

            FromTo: new FormControl({ value: [], disabled: true }),
            Status: new FormControl(0),
            CreatedAt: new FormControl(new Date())
        })
    }
}