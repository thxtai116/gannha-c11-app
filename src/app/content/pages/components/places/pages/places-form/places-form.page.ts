import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';

import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import {
    PlaceForm,

    PlaceService,
    SubheaderService,

    AddressContactModel,
    TimingModel,
    CoordinateModel,

    ValidCoordinates,
    SystemAlertService,
} from '../../../../../../core/core.module';

@Component({
    selector: 'm-places-form',
    templateUrl: './places-form.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlacesFormPage implements OnInit, OnDestroy {
    private _obsers: any[] = [];

    lang: string = "vi";

    viewControl: any = {
        submitting: false,
        loading$: new BehaviorSubject<boolean>(false)
    };

    id: string = "";

    viewForm: any = {
        form: new PlaceForm()
    };

    form: FormGroup;

    constructor(
        private _router: Router,
        private _placeService: PlaceService,
        private _subheaderService: SubheaderService,
        private _translate: TranslateService,
        private _systemAlertService: SystemAlertService,
    ) {
        this.form = this.generateForm();
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

        place.Id = this.id;

        this.viewControl.submitting = true;
        this.viewControl.loading$.next(true);

        Promise.all([
            this._placeService.create(place)
        ]).then(value => {
            this._systemAlertService.success(this._translate.instant("PLACES.CREATE_SUCCESSFUL"));
            this._router.navigate(["/places", value[0].Id]);
        }).finally(() => {
            this.viewControl.submitting = false;
            this.viewControl.loading$.next(false);
        });
    }

    ngOnInit() {
        this.viewControl.loading$.next(true);

        this.bindBreadcrumbs();
        this.bindSubscribes();

        Promise.all([
            this._placeService.generateId()
        ]).then(value => {
            this.id = value[0];
        }).finally(() => {
            this.viewControl.loading$.next(false);
        });
    }
    
    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    private bindSubscribes() {
        this._obsers.push(
            this._translate.onLangChange.subscribe(() => {
                this.bindBreadcrumbs();
            })
        );
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "PLACES.LIST", page: '/places' },
            { title: "PLACES.NEW_PLACE", page: `/places/create` }
        ]);
    }

    private generateForm() {
        return new FormGroup({
            Name: new FormControl('', [<any>Validators.required, <any>Validators.minLength(3)]),

            AddressContact: new FormControl(new AddressContactModel()),
            Location: new FormControl(new CoordinateModel(), [<any>ValidCoordinates.validate()]),

            Timing: new FormControl(new TimingModel()),
        });
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
}
