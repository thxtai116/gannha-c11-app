import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { AreaService, LanguagePipe } from '../../../../../core/core.module';

@Component({
    selector: 'm-countries-selector',
    templateUrl: './countries-selector.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CountriesSelectorComponent implements OnInit {

    @Input() readonly: boolean = true;
    @Input() required: boolean = false;

    @Input()
    set country(value) {
        this._country$.next(value);
    };

    get country() {
        return this._country$.getValue();
    }

    @Output() onChange: EventEmitter<string> = new EventEmitter<string>();

    private _country$ = new BehaviorSubject<string>(null);

    private _obsers: any[] = [];

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false)
    }

    viewData: any = {
        countries$: new BehaviorSubject<any[]>([])
    }

    viewModel: any = {
        countryName: ""
    }

    viewForm: any = {
        countryId: ""
    }

    lang: string = "vi";

    constructor(
        private _areaService: AreaService,
        private _changeRef: ChangeDetectorRef
    ) {
        this.viewControl.loading$.next(true);
    }

    ngOnInit(): void {
        this.bindSubscribes();
        this.init();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    onCountryChange(): void {
        if (this.country !== this.viewForm.countryId) {
            this.onChange.emit(this.viewForm.countryId);
        }
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this._country$.subscribe(() => {
                if (this.country && this.country !== this.viewForm.countryId) {
                    this.viewForm.countryId = JSON.parse(JSON.stringify(this.country));
                }
            })
        );
    }

    private init(): void {
        Promise.all([
            this._areaService.getCountries()
        ]).then(value => {
            let countries = value[0].map(x => {
                return {
                    "id": x.Id,
                    "text": new LanguagePipe().transform(x.Name)
                };
            });

            this.viewData.countries$.next(countries);

            if (value[0].length > 0) {
                this.viewModel.countryName = new LanguagePipe().transform(value[0][0].Name);

                this._changeRef.detectChanges();

                this.onChange.emit(this.viewForm.countryId);
            }
        });
    }
}
