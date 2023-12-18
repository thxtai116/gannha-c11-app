import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import {
    RawUnitModel,
    UnitModel,

    UnitService,
    LanguagePipe,
    CoordinateModel
} from '../../../../../../core/core.module';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'm-raw-units-detail',
    templateUrl: './raw-units-detail.component.html',
})
export class RawUnitsDetailComponent implements OnInit {

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false)
    }

    viewData: any = {
        rawUnit: new RawUnitModel(),
        unit: new UnitModel(),
    };

    viewModel: any = {
        unit: {},
        unitLocation: new CoordinateModel(),
    }

    constructor(
        private _unitService: UnitService,
        public dialogRef: MatDialogRef<RawUnitsDetailComponent>,
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
            
            this.viewModel.unitLocation = location;
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
