import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';

import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import {
    BrandModel,
    UnitOverviewViewModel,

    SubheaderService,
    BrandService,

    UnitTransformer,
} from '../../../../../../core/core.module';

import { UnitsState } from '../../states';
import { UnitQuickCreateComponent } from '../../../../shared/shared.module';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
    selector: 'm-units-map-view',
    templateUrl: './units-map-view.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnitsMapViewPage implements OnInit {
    private _obsers: any[] = [];

    private _readyConditions: Map<string, boolean> = new Map([
        ["Brand", false]
    ]);

    viewControl: any = {
        ready: false,
        loading$: new BehaviorSubject<boolean>(false)
    };

    viewData: any = {
        brand: new BrandModel(),
        units$: new BehaviorSubject<UnitOverviewViewModel[]>([]),
        unitsResult: new Array<UnitOverviewViewModel>(),
        unitsStored: new Array<UnitOverviewViewModel>()
    };

    viewFilter: any = {
        filterStatus: ""
    };

    unitsLocations: FormControl = new FormControl([]);

    constructor(
        private _router: Router,
        private _brandService: BrandService,
        private _subheaderService: SubheaderService,
        private _translate: TranslateService,
        private _unitTransformer: UnitTransformer,
        private _unitsState: UnitsState,
        public dialog: MatDialog,
    ) {
    }

    ngOnInit(): void {
        this.viewControl.loading$.next(true);

        this.bindSubscribes();
    }

    refresh(): void {
        this.viewControl.loading$.next(true);

        Promise.all([
            this._brandService.getUnits(this.viewData.brand.Id)
        ]).then(value => {
            let units = value[0];
            let vms = units.map(value => {
                return this._unitTransformer.toUnitOverView(value);
            });

            this.viewData.units$.next(vms);
        }).finally(() => {
            this.viewControl.loading$.next(false);
        });
    }

    quickCreate() {
        const dialogRef = this.dialog.open(UnitQuickCreateComponent, { data: this.viewData.brand, disableClose: true });

        let sub = dialogRef.afterClosed().subscribe(res => {
            if (!res)
                return;

            this.refresh();

            sub.unsubscribe();
        });
    }

    showList(): void {
        this._router.navigate(['/units']);
    }

    onMarkerDetailsSelected(event: any) {
        this._router.navigate(['/units', event, 'basic-info']);
    }

    onMarkerLocationSelected(event: any) {
        this._router.navigate(['/units', event, 'location']);
    }

    private init(): void {
        if (Array.from(this._readyConditions.values()).filter(x => x === false).length === 0) {
            if (this.viewControl.ready) return;

            this.viewControl.ready = true;

            this.bindBreadcrumbs();

            Promise.all([
                this._brandService.getUnits(this.viewData.brand.Id)
            ]).then(value => {
                let units = value[0];
                let vms = units.map(value => {
                    return this._unitTransformer.toUnitOverView(value);
                });

                this.viewData.units$.next(vms);
            }).finally(() => {
                this.viewControl.loading$.next(false);
            });
        }
    }

    private parseUnitsLocations(units: UnitOverviewViewModel[]) {
        this.unitsLocations.setValue(units);
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "UNITS.MAP_VIEW", page: `/units/map-view` }
        ]);
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this._unitsState.brand$.subscribe(value => {
                if (value) {
                    this.viewData.brand = value;

                    this._readyConditions.set("Brand", true);

                    if (this.viewControl.ready) {
                        this.refresh();
                    } else {
                        this.init();
                    }
                }
            })
        );

        this._obsers.push(
            this.viewData.units$.subscribe(res => {
                this.viewData.unitsStored = res;

                this.parseUnitsLocations(res)
            })
        );

        this._obsers.push(
            this._translate.onLangChange.subscribe(() => {
                this.bindBreadcrumbs();
            })
        );
    }
}
