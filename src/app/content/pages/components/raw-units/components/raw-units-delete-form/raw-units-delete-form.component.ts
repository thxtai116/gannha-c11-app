import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import {
    RawUnitModel,
    UnitModel,
    CoordinateModel,

    LanguagePipe,
    UnitService,
    ConfirmService,
    SystemAlertService
} from '../../../../../../core/core.module';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'm-raw-units-delete-form',
    templateUrl: 'raw-units-delete-form.component.html',
})
export class RawUnitsDeleteFormComponent implements OnInit {

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false)
    }

    viewData: any = {
        rawUnit: new RawUnitModel(),
        unit: new UnitModel(),
        unitLocation: new CoordinateModel(),
    };

    viewModel: any = {
        unit: {}
    }

    constructor(
        private _translate: TranslateService,
        private _unitService: UnitService,
        private _confirmService: ConfirmService,
        private _systemAlertService: SystemAlertService,
        public dialogRef: MatDialogRef<RawUnitsDeleteFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) { }

    ngOnInit() {
        this.viewData.rawUnit = this.data;

        if (this.viewData.rawUnit.ReferenceId && this.viewData.rawUnit.ReferenceId.length > 0) {
            this.init(this.viewData.rawUnit.ReferenceId);
        }
    }

    close(): void {
        this.dialogRef.close();
    }

    delete(): void {
        const confirmDialog = this._confirmService.show(this._translate.instant("RAW_UNITS.DEACTIVATE_UNIT_TITLE"),
            this._translate.instant("RAW_UNITS.DEACTIVATE_UNIT_MESSAGE"));

        let sub = confirmDialog.afterClosed().subscribe(res => {
            if (res) {
                this.viewControl.loading$.next(true);
                Promise.all([
                    this._unitService.deactivate(this.viewData.rawUnit.ReferenceId)
                ]).then(value => {
                    if (value[0]) {
                        this._systemAlertService.success(this._translate.instant("COMMON.DEACTIVATE_SUCCESS"));
                    }
                }).finally(() => {
                    this.viewControl.loading$.next(false);
                    this.dialogRef.close({
                        data: {
                            Id: this.viewData.rawUnit.ReferenceId
                        }
                    });

                    sub.unsubscribe();
                })
            }
        })
    }

    init(id: string): void {
        this.viewControl.loading$.next(true);

        Promise.all([
            this._unitService.get(id)
        ]).then(value => {
            this.viewData.unit = value[0];
            this.viewModel.unit = this.parseUnitToViewModel(value[0]);

            let location = new CoordinateModel();
            location.Latitude = value[0].Latitude;
            location.Longitude = value[0].Longitude;

            this.viewData.unitLocation = location;
        }).finally(() => {
            this.viewControl.loading$.next(false);
        })
    }

    private parseUnitToViewModel(unit: UnitModel): any {
        let vm: any = {};

        vm.Id = unit.Id;
        vm.Name = new LanguagePipe().transform(unit.Name);
        vm.Address = unit.Contact && unit.Contact.Address ? new LanguagePipe().transform(unit.Contact.Address) : "";
        vm.Status = unit.Status;
        vm.UpdatedAt = new Date(unit.CreatedAt);
        vm.CreatedAt = new Date(unit.CreatedAt);
        vm.Lat = unit.Latitude;
        vm.Long = unit.Longitude;
        vm.BrandId = unit.BrandId;

        return vm;
    }
}
