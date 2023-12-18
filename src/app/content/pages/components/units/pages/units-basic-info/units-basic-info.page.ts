import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';

import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

import {
    BrandModel,
    UtilityModel,
    UnitModel,
    UserInfoModel,

    UnitBasicInfoViewModel,
    PlaceOverviewViewModel,

    SubheaderService,
    UnitService,
    ConfirmService,
    SystemAlertService,

    LanguagePipe,
    PlaceService,
    PlaceTransformer,

    GlobalState,
    RoleType,
} from '../../../../../../core/core.module';

import { UnitsDetailState } from '../../states/index';

@Component({
    selector: 'm-units-basic-info',
    templateUrl: './units-basic-info.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnitsBasicInfoPage implements OnInit {
    private _obsers: any[] = [];

    private _readyConditions: Map<string, boolean> = new Map([
        ["User", false],
        ["Unit", false]
    ]);

    lang: string = "vi";

    viewControl: any = {
        submitting: false,
        ready: false,
        loading$: new BehaviorSubject<boolean>(false),
        allowToModifyStatus: false
    }

    viewData: any = {
        userInfo: new UserInfoModel(),
        brand: new BrandModel(),
        unit: new UnitModel(),
        places: new Array<PlaceOverviewViewModel>(),
        backupUnit: new UnitModel(),
        utilities: new Array<UtilityModel>()
    }

    viewModel: any = {
        unit: new UnitBasicInfoViewModel()
    }

    form: FormGroup;

    constructor(
        private _globalState: GlobalState,
        private _unitsDetailState: UnitsDetailState,
        private _subheaderService: SubheaderService,
        private _unitService: UnitService,
        private _placeService: PlaceService,
        private _confirmService: ConfirmService,
        private _systemAlertService: SystemAlertService,
        private _placeTransformer: PlaceTransformer,
        private _translate: TranslateService,
        public dialog: MatDialog
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

        if (!this.form.valid) {
            this._systemAlertService.error(this._translate.instant("COMMON.ERROR.FORM_INVALID"));

            return;
        }

        await this.updateUnit();
    }

    async updateUnit() {
        if (this.viewControl.submitting) {
            return;
        }

        this.viewControl.submitting = true;

        this.viewControl.loading$.next(true);

        let unit = this.parseFormGroup(this.form);

        let result = await this._unitService.updateUnitBasicInfo(unit, this.lang);

        this.viewControl.submitting = false;

        if (result) {
            let unitResult = await this._unitService.get(unit.Id);

            this.viewControl.ready = false;

            this._unitsDetailState.unit$.next(unitResult);

            this._systemAlertService.success(this._translate.instant("UNITS.UPDATE_SUCCESSFUL"));
        }

        this.viewControl.loading$.next(false);
    }

    activate(): void {
        const dialogRef = this._confirmService.show(this._translate.instant('COMMON.CONFIRMATION'), this._translate.instant('UNITS.ACTIVATE_COMFIRM'));

        let sub = dialogRef.afterClosed().subscribe(res => {
            if (!res) {
                return;
            }

            this.viewControl.loading$.next(true);

            Promise.all([
                this._unitService.activate(this.viewData.unit.Id)
            ]).then(value => {
                if (value[0]) {
                    this._systemAlertService.success(this._translate.instant('COMMON.ACTIVATE_SUCCESS'));

                    this.reload();
                } else {
                    this.viewControl.loading$.next(false);
                }
            }).catch(() => {
                this.viewControl.loading$.next(false);
            }).finally(() => sub.unsubscribe());
        });
    }

    deactivate(): void {
        const dialogRef = this._confirmService.show(this._translate.instant('COMMON.CONFIRMATION'), this._translate.instant('UNITS.DEACTIVATE_COMFIRM'));

        let sub = dialogRef.afterClosed().subscribe(res => {
            if (!res) {
                return;
            }

            this.viewControl.loading$.next(true);

            Promise.all([
                this._unitService.deactivate(this.viewData.unit.Id)
            ]).then(value => {
                if (value[0]) {
                    this._systemAlertService.success(this._translate.instant('COMMON.DEACTIVATE_SUCCESS'));

                    this.reload();
                } else {
                    this.viewControl.loading$.next(false);
                }
            }).catch(() => {
                this.viewControl.loading$.next(false);
            }).finally(() => sub.unsubscribe());
        });
    }

    private reload() {
        Promise.all([
            this._unitService.get(this.viewData.unit.Id)
        ]).then(value => {
            let unit = value[0];

            this.viewControl.ready = false;

            this._unitsDetailState.unit$.next(unit);
        }).catch(() => {
            this.viewControl.loading$.next(false);
        })
    }

    private init(): void {
        if (Array.from(this._readyConditions.values()).filter(x => x === false).length === 0) {
            if (this.viewControl.ready)
                return;

            this.viewControl.ready = true;

            Promise.all([
                this._placeService.getAll()
            ]).then(value => {
                let vms = value[0].map(x => this._placeTransformer.toPlaceOverview(x));

                this.viewData.places = vms;

                this.bindBreadcrumbs();

                this.viewModel.unit = this.parseToViewModel(this.viewData.unit);

                this.parseToFormGroup(JSON.parse(JSON.stringify(this.viewData.unit)));

                this.viewControl.loading$.next(false);
            }).catch(() => {
                this.viewControl.loading$.next(false);
            })
        }
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "UNITS.LIST", page: `/units` },
            { title: `${new LanguagePipe().transform(this.viewData.unit.Name)}`, page: `/units/${this.viewData.unit.Id}` },
            { title: "UNITS.BASIC_INFO", page: `/units/${this.viewData.unit.Id}/basic-info` }
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
            this._globalState.userInfoSub$.subscribe(value => {
                if (value) {
                    this.viewData.userInfo = value;

                    this._readyConditions.set("User", true);

                    this.viewControl.allowToModifyStatus = value.RoleNames.indexOf(RoleType.Locator) === -1;

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
        )
    }

    private parseFormGroup(form: FormGroup): UnitModel {
        let unit = new UnitModel();

        unit.BrandId = this.viewData.unit.BrandId;
        unit.Id = this.viewData.unit.Id
        unit.Name[this.lang] = form.get('Name').value;

        unit.Contact.Street = this.viewData.unit.Contact.Street;
        unit.Contact.Address = this.viewData.unit.Contact.Address;
        unit.Contact.Administration = this.viewData.unit.Contact.Administration;

        if (form.get('Place').value && form.get('Place').value.length > 0) {
            let placeId = form.get('Place').value;

            unit.Contact.BuildingId = placeId;
            unit.Contact.BuildingName[this.lang] = this.viewData.places.filter(x => x.Id == placeId)[0].Name;
        }

        let Timing = {
            Specific: form.get('Timing').value.Specific,
            Open: form.get('Timing').value.Open,
            Close: form.get('Timing').value.Close,
            Is24H: form.get('Timing').value.Is24H,
        }

        unit.Timing = Timing;

        unit.Contact.Phone = form.get('Contact').value;
        unit.Utilities = form.get('Utilities').value;

        return unit;
    }

    private parseToViewModel(unit: UnitModel): UnitBasicInfoViewModel {
        let vm = new UnitBasicInfoViewModel();

        vm.Name = new LanguagePipe().transform(unit.Name);
        vm.Address = new LanguagePipe().transform(unit.Contact.Address);
        vm.Status = unit.Status;
        vm.Utilities = unit.Utilities;
        vm.Phones = unit.Contact.Phone;
        vm.BusinessCenter = unit.Contact && unit.Contact.BuildingName ? new LanguagePipe().transform(unit.Contact.BuildingName) : "";
        vm.Timing = unit.Timing;

        return vm;
    }

    private parseToFormGroup(unit: UnitModel) {
        this.form.get('Name').setValue(new LanguagePipe().transform(unit.Name));

        this.form.get('Place').setValue(unit.Contact.BuildingId);

        this.form.get('Utilities').setValue(unit.Utilities);
        this.form.get('Contact').setValue(unit.Contact.Phone);
        this.form.get('Timing').setValue(unit.Timing);

        this.form.get('Address').setValue(unit.Contact.Address[this.lang]);
    }

    private generateForm(): FormGroup {
        return new FormGroup({
            Name: new FormControl('', [Validators.required]),
            Place: new FormControl(new PlaceOverviewViewModel()),
            Utilities: new FormControl([]),
            Contact: new FormControl([]),
            Timing: new FormControl(''),
            Address: new FormControl({ value: '', disabled: true }),
        });
    }
}