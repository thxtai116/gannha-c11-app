import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { AreaService, LanguagePipe, } from '../../../../../core/core.module';

@Component({
    selector: 'm-provinces-selector',
    templateUrl: './provinces-selector.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProvincesSelectorComponent implements OnInit {

    @Input() readonly: boolean = true;
    @Input()
    set country(value) {
        this._country$.next(value);
    };

    get country() {
        return this._country$.getValue();
    }

    @Input()
    set province(value) {
        this._province$.next(value);
    };

    get province() {
        return this._province$.getValue();
    }

    @Output() onChange: EventEmitter<string> = new EventEmitter<string>();

    private _country$ = new BehaviorSubject<string>(null);
    private _province$ = new BehaviorSubject<string>(null);

    private _obsers: any[] = [];

    viewData: any = {
        provinces$: new BehaviorSubject<any[]>([])
    }

    viewModel: any = {
        provinceName: ""
    }

    viewForm: any = {
        provinceId: ""
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

    onProvinceChange(): void {
        if (this.province !== this.viewForm.provinceId) {
            this.onChange.emit(this.viewForm.provinceId);
        }
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this._country$.subscribe(() => {
                if (this.country) {
                    this.init();
                }
            })
        );

        this._obsers.push(
            this._province$.subscribe(() => {
                if (this.province && this.province !== this.viewForm.provinceId) {
                    this.viewForm.provinceId = JSON.parse(JSON.stringify(this.province));

                    this.getProvinceName();
                }
            })
        );
    }

    private init(): void {
        Promise.all([
            this._areaService.getProvinces(this.country)
        ]).then(value => {
            let provinces = value[0].map(x => {
                return {
                    "id": x.Id,
                    "text": new LanguagePipe().transform(x.Name)
                };
            });

            this.viewData.provinces$.next(provinces);

            this.getProvinceName();
        });
    }

    private getProvinceName(): void {
        let provinces = this.viewData.provinces$.getValue();

        if (provinces && this.province) {
            let province = provinces.find(x => x.id === this.province);

            if (province) {
                this.viewModel.provinceName = province.text;

                this._changeRef.detectChanges();
            }
        }
    }
}
