import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { AreaService, LanguagePipe } from '../../../../../core/core.module';

@Component({
    selector: 'm-wards-selector',
    templateUrl: './wards-selector.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WardsSelectorComponent implements OnInit {

    @Input() readonly: boolean = true;
    @Input()
    set district(value) {
        this._district$.next(value);
    };

    get district() {
        return this._district$.getValue();
    }

    @Input()
    set ward(value) {
        this._ward$.next(value);
    };

    get ward() {
        return this._ward$.getValue();
    }

    @Output() onChange: EventEmitter<string> = new EventEmitter<string>();

    private _district$ = new BehaviorSubject<string>(null);
    private _ward$ = new BehaviorSubject<string>(null);

    private _obsers: any[] = [];

    viewData: any = {
        wards$: new BehaviorSubject<any[]>([])
    }

    viewModel: any = {
        wardName: ""
    }

    viewForm: any = {
        wardId: ""
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

    onWardChange(): void {
        if (this.ward !== this.viewForm.wardId) {
            this.onChange.emit(this.viewForm.wardId);
        }
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this._district$.subscribe(() => {
                if (this.district) {
                    this.init();
                }
            })
        );

        this._obsers.push(
            this._ward$.subscribe(() => {
                if (this.ward && this.ward !== this.viewForm.wardId) {
                    this.viewForm.wardId = JSON.parse(JSON.stringify(this.ward));

                    this.getWardName();
                }
            })
        );
    }

    private init(): void {
        Promise.all([
            this._areaService.getWards(this.district)
        ]).then(value => {
            let wards = value[0].map(x => {
                return {
                    "id": x.Id,
                    "text": new LanguagePipe().transform(x.Name)
                };
            });

            this.viewData.wards$.next(wards);

            this.getWardName();
        });
    }

    private getWardName(): void {
        let wards = this.viewData.wards$.getValue();

        if (wards && this.ward) {
            let ward = wards.find(x => x.id === this.ward);

            if (ward) {
                this.viewModel.wardName = ward.text;

                this._changeRef.detectChanges();
            }
        }
    }
}
