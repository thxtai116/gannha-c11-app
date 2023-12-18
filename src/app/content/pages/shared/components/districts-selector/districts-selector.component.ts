import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { AreaService, LanguagePipe } from '../../../../../core/core.module';

@Component({
    selector: 'm-districts-selector',
    templateUrl: './districts-selector.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DistrictsSelectorComponent implements OnInit {

    @Input() readonly: boolean = true;
    @Input()
    set province(value) {
        this._province$.next(value);
    };

    get province() {
        return this._province$.getValue();
    }

    @Input()
    set district(value) {
        this._district$.next(value);
    };

    get district() {
        return this._district$.getValue();
    }

    @Output() onChange: EventEmitter<string> = new EventEmitter<string>();

    private _province$ = new BehaviorSubject<string>(null);
    private _district$ = new BehaviorSubject<string>(null);

    private _obsers: any[] = [];

    viewData: any = {
        districts$: new BehaviorSubject<any[]>([])
    }

    viewModel: any = {
        districtName: ""
    }

    viewForm: any = {
        districtId: ""
    }

    lang: string = "vi";

    constructor(
        private _areaService: AreaService,
        private _changeRef: ChangeDetectorRef
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

    onDistrictChange(): void {
        if (this.district !== this.viewForm.districtId) {
            this.onChange.emit(this.viewForm.districtId);
        }
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this._province$.subscribe(() => {
                if (this.province) {
                    this.init();
                }
            })
        );

        this._obsers.push(
            this._district$.subscribe(() => {
                if (this.district && this.district !== this.viewForm.districtId) {
                    this.viewForm.districtId = JSON.parse(JSON.stringify(this.district));

                    this.getDistrictName();
                }
            })
        );
    }

    private init(): void {
        Promise.all([
            this._areaService.getDistricts(this.province)
        ]).then(value => {
            let districts = value[0].map(x => {
                return {
                    "id": x.Id,
                    "text": new LanguagePipe().transform(x.Name)
                };
            });

            this.viewData.districts$.next(districts);

            this.getDistrictName();
        });
    }

    private getDistrictName(): void {
        let districts = this.viewData.districts$.getValue();

        if (districts && this.district) {
            let district = districts.find(x => x.id === this.district);

            if (district) {
                this.viewModel.districtName = district.text;

                this._changeRef.detectChanges();
            }
        }
    }
}
