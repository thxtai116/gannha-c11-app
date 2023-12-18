import { Component, OnInit, ChangeDetectionStrategy, Input, forwardRef, Injector, ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import {
    AddressContactModel,

    LanguagePipe,
    AdministrativeType,
    AreaService,
} from '../../../../../core/core.module';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'm-address-contact',
    templateUrl: './address-contact.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => AddressContactComponent),
            multi: true,
        },
    ],
})
export class AddressContactComponent implements OnInit, ControlValueAccessor {
    @Input() readonly: boolean = true;
    @Input() required: boolean = false;

    private _onChangeCallback = (value: any) => { };

    private _obsers: any[] = [];

    viewData: any = {
        address$: new BehaviorSubject<AddressContactModel>(new AddressContactModel()),
        street: ""
    }

    viewModel: any = {
        street: ""
    }

    lang = "vi";

    viewForm: any = {
        addressContact: new AddressContactModel(),
    }

    constructor(
        private _areaService: AreaService,
        private _changeRef: ChangeDetectorRef,
    ) {
    }

    ngOnInit(): void {
        let a = this;
        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    onAdministrationChange(event): void {
        this.viewForm.addressContact.Administration = event;
        this.submit();
    }

    onStreetChange(): void {
        this.submit();
    }

    async submit() {
        if (!this.readonly) {
            this.viewForm.addressContact.Street[this.lang] = this.viewData.street;
            this.viewForm.addressContact.Address[this.lang] = await this.parseAddress(this.viewForm.addressContact);
            this._onChangeCallback(this.viewForm.addressContact);
        }
    }

    writeValue(obj: any): void {
        if (obj) {
            this.viewData.address$.next(obj);
        }
    }

    registerOnChange(fn: any): void {
        this._onChangeCallback = fn;
    }

    registerOnTouched(fn: any): void { }

    private bindSubscribes(): void {
        this._obsers.push(
            this.viewData.address$.subscribe(async () => {
                if (this.viewData.address$.getValue()) {
                    this.viewModel.street = new LanguagePipe().transform(this.viewData.address$.getValue().Street);

                    this.viewData.street = JSON.parse(JSON.stringify(this.viewModel.street));
                    this.viewForm.addressContact.Street[this.lang] = JSON.parse(JSON.stringify(this.viewModel.street));
                    this.viewForm.addressContact.Administration = this.viewData.address$.getValue().Administration;
                    this.viewForm.addressContact.Address[this.lang] = await this.parseAddress(this.viewData.address$.getValue());

                    this._changeRef.detectChanges();
                }
            })
        );
    }

    private async parseAddress(addressContact: AddressContactModel) {
        let address = new LanguagePipe().transform(addressContact.Street);

        if (addressContact.Administration) {
            if (addressContact.Administration[AdministrativeType.Ward]) {
                let wardId = addressContact.Administration[AdministrativeType.Ward];
                let wards = await this._areaService.getWards(addressContact.Administration[AdministrativeType.District]);
                let ward = wards.find(x => x.Id == wardId);
                if (ward)
                    address += address.length > 0 ? `, ${new LanguagePipe().transform(ward.Name)}` :
                        new LanguagePipe().transform(ward.Name);
            }

            if (addressContact.Administration[AdministrativeType.District]) {
                let districtId = addressContact.Administration[AdministrativeType.District];
                let districts = await this._areaService.getDistricts(addressContact.Administration[AdministrativeType.Province]);
                let district = districts.find(x => x.Id == districtId);
                if (district)
                    address += address.length > 0 ? `, ${new LanguagePipe().transform(district.Name)}` :
                        new LanguagePipe().transform(district.Name);
            }

            if (addressContact.Administration[AdministrativeType.Province]) {
                let provinceId = addressContact.Administration[AdministrativeType.Province];
                let provinces = await this._areaService.getProvinces(addressContact.Administration[AdministrativeType.Country]);
                let province = provinces.find(x => x.Id == provinceId);
                if (province)
                    address += address.length > 0 ? `, ${new LanguagePipe().transform(province.Name)}` :
                        new LanguagePipe().transform(province.Name);
            }
        }

        return address;
    }
}
