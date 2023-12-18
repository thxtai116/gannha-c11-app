import { Component, OnInit, Inject, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatBottomSheet } from '@angular/material';
import { BehaviorSubject } from 'rxjs';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import {
    BrandModel,
    AddressContactModel,
    CoordinateModel,
    UnitModel,

    UnitService,
    AreaService,
    SystemAlertService,
    ValidCoordinates,
    ConfirmService,
    ValidAddressContact,
} from '../../../../../core/core.module';
import { TranslateService } from '@ngx-translate/core';
import { AddressParserBottomSheetComponent } from '../address-parser/address-parser.component';

@Component({
    selector: 'm-unit-quick-create',
    templateUrl: './unit-quick-create.component.html',
    styleUrls: ['./unit-quick-create.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnitQuickCreateComponent implements OnInit {

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false),
        submitting: false
    }

    viewData: any = {
        form: {},
        brand: new BrandModel(),
        unitId: "",
        address: "",
    };

    lang = "vi";

    unitForm: FormGroup;

    constructor(
        public dialogRef: MatDialogRef<UnitQuickCreateComponent>,
        private _unitService: UnitService,
        private _areaService: AreaService,
        private _systemAlertService: SystemAlertService,
        private _confirmService: ConfirmService,
        private _translate: TranslateService,
        private _bottomSheet: MatBottomSheet,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.generateCreateForm();
    }

    ngOnInit() {
        this.viewControl.loading$.next(true);
        this.viewData.brand = this.data;

        Promise.all([
            this._unitService.generateId()
        ]).then(value => {
            this.viewData.unitId = value[0];
        }).finally(() => {
            this.viewControl.loading$.next(false);
        });
    }

    save() {
        const controls = this.unitForm.controls;

        for (let control in this.unitForm.controls) {
            this.unitForm.controls[control].markAsDirty();
        }

        if (this.unitForm.invalid) {
            Object.keys(controls).forEach(controlName =>
                controls[controlName].markAsTouched()
            );
            this._systemAlertService.error(this._translate.instant("COMMON.ERROR.FORM_INVALID"));
            return;
        }

        if (!this.unitForm.get('Location').value.Latitude || !this.unitForm.get('Location').value.Longitude) {
            this._systemAlertService.error("Vui lòng chọn vị trí.");
            return;
        }

        this.verifyUnitLocation(this.parseUnitfromForm(this.unitForm))
    }

    getAdministraion() {
        let data: any = {
            address: this.viewData.address
        }
        let addressParser = this._bottomSheet.open(AddressParserBottomSheetComponent, { data });

        addressParser.afterDismissed().subscribe(res => {
            if (res) {
                this.viewData.address = res.address;
                let address = res.address;
                this.viewControl.loading$.next(true);

                Promise.all([
                    this._areaService.getAdministrationFromAddress(address)
                ]).then(value => {
                    this.parseRawtoForm(value[0]);
                }).finally(() => {
                    this.viewControl.loading$.next(false);
                });
            }
        })
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
                        this.createUnit(unit);

                    sub.unsubscribe();
                });
            } else if (result && !result.duplicated) {
                this.createUnit(unit);
            }
        }).finally(() => {
            this.viewControl.loading$.next(false);
        });
    }

    private async createUnit(unit: UnitModel) {
        if (this.viewControl.submitting) {
            return;
        }

        this.viewControl.submitting = true;

        this.viewControl.loading$.next(true);

        let data = await this._unitService.createUnit(unit);

        this.viewControl.loading$.next(false);

        if (data) {
            this._systemAlertService.success("Tạo cửa hiệu thành công.");

            this.dialogRef.close({
                data: data
            });
        }
    }

    close() {
        this.dialogRef.close();
    }

    // searchOnMap() {
    //     this.viewData.address = new LanguagePipe().transform(this.unitForm.get('AddressContact').value.Address);
    // }

    private parseRawtoForm(rawAdministration: any) {
        let addressContact = new AddressContactModel();
        addressContact.Address["vi"] = rawAdministration.Address.replace(", Việt Nam", "");
        addressContact.Administration["2"] = rawAdministration.Admin2.Id;
        addressContact.Administration["4"] = rawAdministration.Admin4.Id;
        addressContact.Administration["6"] = rawAdministration.Admin6.Id;
        addressContact.Administration["8"] = rawAdministration.Admin8.Id;
        addressContact.Street["vi"] = rawAdministration.Street;

        let location = new CoordinateModel();
        location.Latitude = rawAdministration.Position.Latitude;
        location.Longitude = rawAdministration.Position.Longitude;

        this.unitForm.get('AddressContact').setValue(addressContact);
        this.unitForm.get('Location').setValue(location);
    }

    private parseUnitfromForm(form: FormGroup): UnitModel {
        let unit = new UnitModel();
        unit.Id = this.viewData.unitId;
        unit.BrandId = this.viewData.brand.Id;

        unit.Name[this.lang] = form.get('UnitName').value || "";

        unit.Utilities = this.viewData.brand.Utilities || [];

        unit.Contact.Street = form.get('AddressContact').value.Street || { vi: "" };
        unit.Contact.Administration = form.get('AddressContact').value.Administration || {};
        unit.Contact.Address = form.get('AddressContact').value.Address || { vi: "" };

        unit.Latitude = form.get('Location').value.Latitude;
        unit.Longitude = form.get('Location').value.Longitude;

        unit.Contact.Phone = form.get('Phones').value;

        unit.Timing = this.viewData.brand.Timing;

        return unit;
    }

    private generateCreateForm() {
        this.unitForm = new FormGroup({
            UnitName: new FormControl('', [<any>Validators.required]),
            AddressContact: new FormControl(new AddressContactModel(), [<any>ValidAddressContact.validate()]),
            Location: new FormControl(new CoordinateModel(), [<any>ValidCoordinates.validate()]),
            Phones: new FormControl([]),
        });
    }
}
