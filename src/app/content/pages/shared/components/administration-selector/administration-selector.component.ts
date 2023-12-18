import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { AdministrationType, AdministrativeType } from '../../../../../core/core.module';

@Component({
    selector: 'm-administration-selector',
    templateUrl: './administration-selector.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdministrationSelectorComponent implements OnInit {

    @Input() readonly: boolean = true;
    @Input() required: boolean = false;

    @Input()
    set administration(value) {
        this._administration$.next(value);
    };

    get administration() {
        return this._administration$.getValue();
    }

    @Output() onChange: EventEmitter<AdministrationType> = new EventEmitter<AdministrationType>();

    private _administration$ = new BehaviorSubject<AdministrationType>(null);

    private _obsers: any[] = [];

    viewData: any = {
        initValues: {
            country: "",
            province: "",
            district: "",
            ward: ""
        }
    }

    viewForm: any = {
        country: "",
        province: "",
        district: "",
        ward: ""
    }

    constructor(
    ) {
    }

    ngOnInit(): void {
        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    onCountryChange(event: string): void {
        this.viewData.initValues.country = event;

        if (this.viewForm.country !== event) {
            this.viewForm.country = event;

            if (!this.readonly)
                this.onChange.emit((this.parseForm(this.viewForm)));
        }
    }

    onProvinceChange(event: string): void {
        this.viewData.initValues.province = event;

        if (this.viewForm.province !== event) {
            this.viewForm.province = event;

            if (!this.readonly)
                this.onChange.emit((this.parseForm(this.viewForm)));
        }
    }

    onDistrictChange(event: string): void {
        this.viewData.initValues.district = event;

        if (this.viewForm.district !== event) {
            this.viewForm.district = event;

            if (!this.readonly)
                this.onChange.emit((this.parseForm(this.viewForm)));
        }
    }

    onWardChange(event: string): void {
        if (this.viewForm.ward !== event) {
            this.viewForm.ward = event;

            if (!this.readonly)
                this.onChange.emit((this.parseForm(this.viewForm)));
        }
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this._administration$.subscribe(() => {
                if (this.administration) {
                    this.extractAdministration(this.administration);
                }
            })
        );
    }

    private parseForm(form: any): AdministrationType {
        let model = {};

        model[AdministrativeType.Country] = form.country;
        model[AdministrativeType.Province] = form.province;
        model[AdministrativeType.District] = form.district;
        model[AdministrativeType.Ward] = form.ward;

        return model;
    }

    private extractAdministration(administration: AdministrationType): void {
        if (administration[AdministrativeType.Country]) {
            this.viewData.initValues.country = administration[AdministrativeType.Country];
            this.viewForm.country = administration[AdministrativeType.Country];
        }

        if (administration[AdministrativeType.Province]) {
            this.viewData.initValues.province = administration[AdministrativeType.Province];
            this.viewForm.province = administration[AdministrativeType.Province];
        }

        if (administration[AdministrativeType.District]) {
            this.viewData.initValues.district = administration[AdministrativeType.District];
            this.viewForm.district = administration[AdministrativeType.District];
        }

        if (administration[AdministrativeType.Ward]) {
            this.viewData.initValues.ward = administration[AdministrativeType.Ward];
            this.viewForm.ward = administration[AdministrativeType.Ward];
        }
    }
}
