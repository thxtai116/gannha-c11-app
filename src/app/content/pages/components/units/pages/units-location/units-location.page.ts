import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import {
    AddressContactModel,
    CoordinateModel,

    UnitModel,
    SubheaderService,
    UnitService,
    SystemAlertService,
    ConfirmService,
    LanguagePipe,

    ValidCoordinates,
    ValidAddressContact,
    AreaService,
} from '../../../../../../core/core.module';

import { UnitsDetailState } from '../../states';
import { AddressParserBottomSheetComponent } from '../../../../shared/shared.module';
import { MatBottomSheet } from '@angular/material';

@Component({
    selector: 'm-units-location',
    templateUrl: './units-location.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnitsLocationPage implements OnInit {

    private _obsers: any[] = [];

    private _readyConditions: Map<string, boolean> = new Map([
    ]);

    lang: string = "vi";

    viewControl: any = {
        submitting: false,
        ready: false,
        loading$: new BehaviorSubject<boolean>(false)
    }

    viewData: any = {
        unit: new UnitModel(),
        address: "",
    }

    form: FormGroup;

    constructor(
        private _unitsDetailState: UnitsDetailState,
        private _unitService: UnitService,
        private _areaService: AreaService,
        private _systemAlertService: SystemAlertService,
        private _subheaderService: SubheaderService,
        private _confirmService: ConfirmService,
        private _translate: TranslateService,
        private _bottomSheet: MatBottomSheet,
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
    async save() {
        if (this.form.invalid) {
            this._systemAlertService.error(this._translate.instant("COMMON.ERROR.FORM_INVALID"));

            return;
        }

        await this.verifyUnitLocation(this.parseUnit(this.form));
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
                    if (res) {
                        this.updateUnit(unit);
                    }

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

        let result = await this._unitService.updateUnitLocation(unit);

        this.viewControl.submitting = false;

        if (result) {
            let unitResult = await this._unitService.get(unit.Id);

            this.viewControl.ready = false;

            this._unitsDetailState.unit$.next(unitResult);

            this._systemAlertService.success(this._translate.instant("UNITS.UPDATE_SUCCESSFUL"));
        }

        this.viewControl.loading$.next(false);
    }

    private parseUnit(form: FormGroup): UnitModel {
        let unit = new UnitModel();

        unit.BrandId = this.viewData.unit.BrandId;
        unit.Id = this.viewData.unit.Id;

        unit.Contact.Address = form.get('Administration').value.Address;
        unit.Contact.Street = form.get('Administration').value.Street;
        unit.Contact.Administration = form.get('Administration').value.Administration;
        unit.Contact.Phone = this.viewData.unit.Contact.Phone;
        unit.Contact.Email = this.viewData.unit.Contact.Email;
        unit.Latitude = form.get('Location').value.Latitude;
        unit.Longitude = form.get('Location').value.Longitude;

        return unit;
    }

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

        this.form.get('Administration').setValue(addressContact);
        this.form.get('Location').setValue(location);
    }

    private parseFormGroup(unit: UnitModel) {
        let address = new AddressContactModel();

        address.Street = unit.Contact.Street;
        address.Address = unit.Contact.Address;
        address.Administration = unit.Contact.Administration;

        let location = new CoordinateModel();

        location.Latitude = unit.Latitude;
        location.Longitude = unit.Longitude;

        this.form.get('Administration').setValue(address);
        this.form.get('Location').setValue(location);
    }

    private init(): void {
        if (Array.from(this._readyConditions.values()).filter(x => x === false).length === 0) {
            if (this.viewControl.ready) return;

            this.viewControl.ready = true;

            this.bindBreadcrumbs();

            this.parseFormGroup(JSON.parse(JSON.stringify(this.viewData.unit)));

            this.viewControl.loading$.next(false);
        }
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "UNITS.LIST", page: `/units` },
            { title: `${new LanguagePipe().transform(this.viewData.unit.Name)}`, page: `/units/${this.viewData.unit.Id}` },
            { title: "UNITS.LOCATION", page: `/units/${this.viewData.unit.Id}/location` }
        ]);
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this._unitsDetailState.unit$.subscribe(value => {
                if (value) {
                    this.viewData.unit = value;

                    this._readyConditions.set("Unit", true);

                    this.init();
                }
            })
        );

        this._obsers.push(
            this._translate.onLangChange.subscribe(() => {
                if (this._readyConditions.get("Unit")) {
                    this.bindBreadcrumbs();
                }
            })
        );
    }

    private generateForm(): FormGroup {
        return new FormGroup({
            Administration: new FormControl(new AddressContactModel(), [<any>ValidAddressContact.validate()]),
            Location: new FormControl(new CoordinateModel(), [<any>ValidCoordinates.validate()]),
        })
    }
}
