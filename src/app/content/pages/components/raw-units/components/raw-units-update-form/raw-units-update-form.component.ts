import { Component, OnInit, Inject, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import {
    RawUnitModel,
    BrandModel,
    UnitModel,
    AddressContactModel,
    CoordinateModel,
    PhoneModel,

    UnitService,
    BrandService,
    AreaService,
    ConfirmService,
    SystemAlertService,

    ValidCoordinates,
    ValidAddressContact,
    CommonUtility,
} from '../../../../../../core/core.module';

@Component({
    selector: 'm-raw-units-update-form',
    templateUrl: 'raw-units-update-form.component.html',
    styleUrls: ['raw-units-update-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RawUnitsUpdateFormComponent implements OnInit {

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false)
    }

    viewData: any = {
        rawUnit: new RawUnitModel(),
        referenceUnit: new UnitModel(),
        unit: new UnitModel(),

        address: "",
        brand: new BrandModel
    };

    form: FormGroup;

    lang: string = "vi";

    constructor(
        private _commonUtil: CommonUtility,
        private _brandService: BrandService,
        private _unitService: UnitService,
        private _areaService: AreaService,
        private _translate: TranslateService,
        private _systemAlertService: SystemAlertService,
        private _confirmService: ConfirmService,
        public dialogRef: MatDialogRef<RawUnitsUpdateFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.form = this.generateForm();
    }

    ngOnInit() {
        this.viewData.rawUnit = this.data as RawUnitModel;
        this.init();
    }

    close(): void {
        this.dialogRef.close();
    }

    onSubmit(): void {
        const controls = this.form.controls;

        if (this.form.invalid) {
            Object.keys(controls).forEach(controlName =>
                controls[controlName].markAsTouched()
            );
            this._systemAlertService.error(this._translate.instant("COMMON.ERROR.FORM_INVALID"));
            return;
        }

        this.verifyUnitLocation(this.parseFormToUnit(this.form));
    }

    private async verifyUnitLocation(unit: UnitModel) {
        this.viewControl.loading$.next(true);

        let verfification = this._unitService.verifyDuplicateUnit(unit);
        verfification.then(result => {
            if (result && result.duplicated) {
                const dialogRef = this._confirmService.show(this._translate.instant("COMMON.WARNING.DUPLICATED_UNITS_TITLE"),
                    this._translate.instant("COMMON.WARNING.DUPLICATED_UNITS_MESSAGE"));

                let sub = dialogRef.afterClosed().subscribe(res => {
                    if (res)
                        this.updateUnit(unit);

                    sub.unsubscribe();
                });
            } else if (result && !result.duplicated) {
                this.updateUnit(unit);
            }
        }).finally(() => {
            this.viewControl.loading$.next(false);
        })
    }

    private async updateUnit(unit: UnitModel) {
        if (this.viewControl.submitting) {
            return;
        }

        this.viewControl.submitting = true;

        this.viewControl.loading$.next(true);

        Promise.all([
            this._unitService.updateUnitBasicInfo(unit, "vi"),
            this._unitService.updateUnitLocation(unit)
        ]).then(value => {
            if (value[0]) {
                this._systemAlertService.success(this._translate.instant("UNITS.CREATE_SUCCESSFUL"));

                this.dialogRef.close({
                    data: value[0]
                });
            }
        }).finally(() => {
            this.viewControl.loading$.next(false);
        })
    }

    private init(): void {
        this.viewControl.loading$.next(true);

        Promise.all([
            this._brandService.get(this.viewData.rawUnit.BrandId),
            this._unitService.get(this.viewData.rawUnit.ReferenceId),
            // this._areaService.getAdministrationFromAddress(this.viewData.rawUnit.Address)
        ]).then(value => {
            this.viewData.brand = value[0];
            this.viewData.unit = value[1];
            this.viewData.referenceUnit = this._commonUtil.parseValue(value[1]);
            this.parseUnitToForm(this._commonUtil.parseValue(value[1]));
            // this.parseRawToReferenceUnit(this.viewData.rawUnit, value[2]);
        }).finally(() => {
            this.viewControl.loading$.next(false);
        });
    }

    // private parseRawToReferenceUnit(rawUnit: RawUnitModel, rawAdministration: any) {
    //     let addressContact = new AddressContactModel();
    //     addressContact.Address["vi"] = rawAdministration.Address.replace(", Việt Nam", "");
    //     addressContact.Administration["2"] = rawAdministration.Admin2.Id;
    //     addressContact.Administration["4"] = rawAdministration.Admin4.Id;
    //     addressContact.Administration["6"] = rawAdministration.Admin6.Id;
    //     addressContact.Administration["8"] = rawAdministration.Admin8.Id;
    //     addressContact.Street["vi"] = rawAdministration.Street;

    //     let location = new CoordinateModel();
    //     location.Latitude = rawAdministration.Position.Latitude;
    //     location.Longitude = rawAdministration.Position.Longitude;

    //     let phone = new PhoneModel();
    //     phone.Value = this.viewData.rawUnit.PhoneString;
    //     phone.Description = { "vi": "N/A" };

    //     this.viewData.referenceUnit.Contact.Street = addressContact.Street;
    //     this.viewData.referenceUnit.Contact.Administration = addressContact.Administration;
    //     this.viewData.referenceUnit.Contact.Address = addressContact.Address;

    //     this.viewData.referenceUnit.Latitude = rawUnit.Latitude;
    //     this.viewData.referenceUnit.Longitude = rawUnit.Longitude;

    //     this.viewData.referenceUnit.Contact.Phone = [phone];
    //     this.viewData.referenceUnit.Contact.Email = rawUnit.Email;
    // }

    private parseUnitToForm(unit: UnitModel) {
        let addressContact = new AddressContactModel();
        addressContact.Address = unit.Contact.Address;
        addressContact.Administration = unit.Contact.Administration;
        addressContact.Street = unit.Contact.Street;

        this.form.patchValue({
            UnitName: unit.Name.vi,
            AddressContact: addressContact,
            Location: { Latitude: unit.Latitude, Longitude: unit.Longitude } as CoordinateModel,
            Phones: unit.Contact.Phone,
        })
    }

    private parseFormToUnit(form: FormGroup): UnitModel {
        let unit: UnitModel = this._commonUtil.parseValue(this.viewData.unit);

        unit.Name[this.lang] = form.get('UnitName').value;

        unit.Contact.Street = form.get('AddressContact').value.Street || { vi: "" };
        unit.Contact.Administration = form.get('AddressContact').value.Administration || {};
        unit.Contact.Address = form.get('AddressContact').value.Address || { vi: "" };

        unit.Latitude = form.get('Location').value.Latitude;
        unit.Longitude = form.get('Location').value.Longitude;

        unit.Contact.Phone = form.get('Phones').value;

        return unit;
    }

    private generateForm(): FormGroup {
        return new FormGroup({
            UnitName: new FormControl('', [<any>Validators.required]),
            AddressContact: new FormControl(new AddressContactModel(), [<any>ValidAddressContact.validate()]),
            Location: new FormControl(new CoordinateModel(), [<any>ValidCoordinates.validate()]),
            Phones: new FormControl([]),
        });
    }
}
