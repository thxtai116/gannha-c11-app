import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { BehaviorSubject } from 'rxjs';

import {
    RawUnitModel,
    UnitModel,
    BrandModel,

    BrandService,
    LanguagePipe,
    CoordinateModel,
    AddressContactModel,
    ValidAddressContact,
    ValidCoordinates,
    SystemAlertService,
    UnitService,
    ConfirmService,
} from '../../../../../../core/core.module';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'm-raw-units-map-form',
    templateUrl: './raw-units-map-form.component.html',
})
export class RawUnitsMapFormComponent implements OnInit {

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false),
        newUnit: false,
    }

    viewData: any = {
        rawUnit: new RawUnitModel(),
        unit: new UnitModel(),
        units: new Array<UnitModel>(),
        units$: new BehaviorSubject<any[]>([]),
        brand: new BrandModel()
    };

    viewModel: any = {
        unit: {
            "Id": ""
        }
    }

    viewFilter: any = {
        filterUnit: ""
    }

    form: FormGroup;

    constructor(
        private _brandService: BrandService,
        private _unitService: UnitService,
        private _systemAlertService: SystemAlertService,
        private _confirmService: ConfirmService,
        private _translate: TranslateService,
        public dialogRef: MatDialogRef<RawUnitsMapFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.form = this.generateForm();
    }

    ngOnInit() {
        this.viewData.rawUnit = this.data as RawUnitModel;

        this.init(this.viewData.rawUnit.BrandId);
    }

    private init(id: string): void {
        this.viewControl.loading$.next(true);

        Promise.all([
            this._brandService.getUnits(id),
            this._brandService.get(id)
        ]).then(value => {
            this.viewData.units = value[0];
            this.viewData.brand = value[1];

            let units = value[0].map(x => {
                return {
                    id: x.Id,
                    text: new LanguagePipe().transform(x.Name)
                }
            });

            this.viewData.units$.next(units);
        }).finally(() => {
            this.viewControl.loading$.next(false);
        })
    }

    onMappingModeChanged(event: any) {
        this.viewControl.newUnit = !!event.index
    }

    onUnitSelect(): void {
        this.viewControl.newUnit = false;
        let unit = this.viewData.units.find(x => x.Id === this.viewFilter.filterUnit);

        if (unit) {
            this.viewModel.unit = this.parseUnitToViewModel(unit);
            this.viewData.unit = unit;
        }
    }

    close(): void {
        this.dialogRef.close();
    }

    onSubmit(): void {
        if (this.viewControl.newUnit) {
            const controls = this.form.controls;

            if (this.form.invalid) {
                Object.keys(controls).forEach(controlName =>
                    controls[controlName].markAsTouched()
                );
                this._systemAlertService.error(this._translate.instant("COMMON.ERROR.FORM_INVALID"));
                return;
            }

            this.verifyUnitLocation(this.parseFormToModel(this.form));
        } else {
            if (this.viewData.unit.Id) {
                let data: any = {
                    Id: this.viewData.unit.Id
                }

                this.dialogRef.close({
                    data: data,
                });
            } else {
                this._systemAlertService.error(this._translate.instant('COMMON.ERROR.FORM_INVALID'));
            }
        }
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
        })
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
            this._systemAlertService.success(this._translate.instant("RAW_UNITS.CREATE_UNIT_SUCCESS"));

            this.dialogRef.close({
                data: data
            });
        }
    }

    private parseUnitToViewModel(unit: UnitModel): any {
        let vm: any = {};

        vm.Id = unit.Id;
        vm.Name = new LanguagePipe().transform(unit.Name);
        vm.Address = unit.Contact && unit.Contact.Address ? new LanguagePipe().transform(unit.Contact.Address) : "";
        vm.Status = unit.Status;
        vm.UpdatedAt = new Date(unit.CreatedAt);
        vm.CreatedAt = new Date(unit.CreatedAt);

        vm.Location = new CoordinateModel();
        vm.Location.Latitude = unit.Latitude;
        vm.Location.Longitude = unit.Longitude;

        vm.BrandId = unit.BrandId;

        return vm;
    }

    private parseFormToModel(form: FormGroup): UnitModel {
        let unit = new UnitModel();
        unit.Id = this.viewData.unitId;
        unit.BrandId = this.viewData.brand.Id;

        unit.Name["vi"] = form.get('UnitName').value || "";

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

    private generateForm(): FormGroup {
        return new FormGroup({
            UnitName: new FormControl('', [<any>Validators.required]),
            AddressContact: new FormControl(new AddressContactModel(), [<any>ValidAddressContact.validate()]),
            Location: new FormControl(new CoordinateModel(), [<any>ValidCoordinates.validate()]),
            Phones: new FormControl([]),
        });
    }
}
