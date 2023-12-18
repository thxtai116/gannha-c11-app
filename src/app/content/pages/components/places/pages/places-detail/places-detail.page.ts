import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import {
    PlaceForm,

    AddressContactModel,
    CoordinateModel,
    TimingModel,
    PlaceModel,

    ValidCoordinates,

    SubheaderService,
    PlaceService,
    SystemAlertService,

    LanguagePipe,
} from '../../../../../../core/core.module';

@Component({
    selector: 'm-places-detail',
    templateUrl: './places-detail.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlacesDetailPage implements OnInit {

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false),
        editMode: false,
        submitting: false,
    }

    viewData: any = {
        place: new PlaceModel()
    }

    viewForm: any = {
        validTiming: false
    }

    form: FormGroup;

    constructor(
        private _route: ActivatedRoute,
        private _subheaderService: SubheaderService,
        private _placeService: PlaceService,
        private _systemAlertService: SystemAlertService,
        private _translate: TranslateService
    ) {
        this.form = this.generateForm();
    }

    ngOnInit() {
        this.viewControl.loading$.next(true);

        this.init();
    }

    edit(): void {
        this.viewControl.editMode = true;
    }

    cancel(): void {
        this.setForm(JSON.parse(JSON.stringify(this.viewData.place)));

        this.viewControl.editMode = false;
    }

    save(): void {
        const controls = this.form.controls;

        if (this.form.invalid) {
            Object.keys(controls).forEach(controlName =>
                controls[controlName].markAsTouched()
            );
            this._systemAlertService.error(this._translate.instant("COMMON.ERROR.FORM_INVALID"));

            return;
        }

        if (this.viewControl.submitting)
            return;

        let place = this.parseForm(this.form);

        place.Id = this.viewData.place.Id;

        this.viewControl.submitting = true;
        this.viewControl.loading$.next(true);

        Promise.all([
            this._placeService.update(place)
        ]).then(value => {
            if (value[0]) {
                this._systemAlertService.success(this._translate.instant("PLACES.UPDATE_SUCCESSFUL"));

                this.init();
            }
        }).finally(() => {
            this.viewControl.editMode = false;
            this.viewControl.submitting = false;
            this.viewControl.loading$.next(false);
        });
    }

    private init() {
        let id = this._route.snapshot.params["id"];

        if (id) {
            Promise.all([
                this._placeService.get(id)
            ]).then(value => {
                this.viewData.place = value[0];

                this.setForm(JSON.parse(JSON.stringify(this.viewData.place)));

                this.bindBreadcrumbs();
            }).finally(() => {
                this.viewControl.loading$.next(false);
            });
        }
    }

    onTimingValidate(event: boolean) {
        this.viewForm.validTiming = event;
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "PLACES.LIST", page: '/places' },
            { title: `${new LanguagePipe().transform(this.viewData.place.Name)}`, page: '/places/:id' }
        ]);
    }

    private setForm(model: PlaceModel): void {
        this.form.get('Name').setValue(new LanguagePipe().transform(model.Name));

        this.form.get('Timing').setValue(model.Timing);
        this.form.get('AddressContact').setValue(model.Contact);

        let coor = new CoordinateModel();

        coor.Latitude = model.Latitude;
        coor.Longitude = model.Longitude;

        this.form.get('Location').setValue(coor);
    }

    private parseForm(form: FormGroup): PlaceForm {
        let place = new PlaceForm();

        place.Name = form.get('Name').value;

        place.Contact.Street = form.get('AddressContact').value.Street || { vi: "" };
        place.Contact.Administration = form.get('AddressContact').value.Administration || {};
        place.Contact.Address = form.get('AddressContact').value.Address || { vi: "" };

        place.Latitude = form.get('Location').value.Latitude;
        place.Longitude = form.get('Location').value.Longitude;

        place.Timing = form.get('Timing').value;

        return place;
    }

    private generateForm() {
        return new FormGroup({
            Name: new FormControl('', [<any>Validators.required, <any>Validators.minLength(3)]),

            AddressContact: new FormControl(new AddressContactModel()),
            Location: new FormControl(new CoordinateModel(), [<any>ValidCoordinates.validate()]),

            Timing: new FormControl(new TimingModel()),
        });
    }
}
