import { Component, OnInit, Input, ChangeDetectionStrategy, forwardRef, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

import {
    CoordinateModel,
    GoogleMapsApiUtility,
    SystemAlertService,
    LocationType
} from '../../../../../core/core.module';

@Component({
    selector: 'm-location-form',
    templateUrl: './location-form.component.html',
    styleUrls: ['./location-form.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => LocationFormComponent),
            multi: true,
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocationFormComponent implements OnInit, OnDestroy, ControlValueAccessor {
    @Input() readonly: boolean = true;
    @Input() lang: string = "vi";

    @Input()
    set address(value) {
        this._address$.next(value);
    };

    get address() {
        return this._address$.getValue();
    }

    private _onChangeCallback = (value: any) => { };

    private _address$: BehaviorSubject<string> = new BehaviorSubject("");

    private _obsers: any[] = [];

    addressInput: string = "";
    editingMode: LocationType = LocationType.EDIT_ADDRESS;
    locationType: any = LocationType;

    inputLat: number = 0;
    inputLong: number = 0;

    mapLat: number = 0;
    mapLong: number = 0;

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false)
    }

    constructor(
        private _googleMapsApiUtil: GoogleMapsApiUtility,
        private _systemAlertService: SystemAlertService,
        private _changeRef: ChangeDetectorRef,
    ) {
    }

    ngOnInit() {
        this.bindSubscribe();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    writeValue(obj: CoordinateModel): void {
        if (obj) {
            this.onLocationChange(obj);
        }
    }

    registerOnChange(fn: any): void {
        this._onChangeCallback = fn;
    }

    registerOnTouched(fn: any): void { }

    setDisabledState?(isDisabled: boolean): void { }

    onLocationChange(event) {
        this.mapLat = event.Latitude;
        this.mapLong = event.Longitude;

        this.inputLat = event.Latitude;
        this.inputLong = event.Longitude;

        let location: CoordinateModel = new CoordinateModel();
        location.Latitude = event.Latitude;
        location.Longitude = event.Longitude;

        // Fix later
        try {
            this._changeRef.detectChanges();
        } catch (error) {
        }

        this._onChangeCallback(location);
    }

    find() {
        this.viewControl.loading$.next(true);

        try {
            if (this.editingMode == LocationType.EDIT_ADDRESS) {
                this.onFindByAddress();
            } else if (this.editingMode == LocationType.EDIT_POSITION) {
                this.onFindByCoordinates();
            }
        } catch{
            this._systemAlertService.error("Không tìm được vị trí")
        } finally {
            this.viewControl.loading$.next(false);
        }
    }

    async onFindByAddress() {
        if (!this.addressInput || this.addressInput.length === 0) {
            this._systemAlertService.error("Vui lòng nhập địa chỉ");
            return;
        }

        let pos = await this._googleMapsApiUtil.getLatLngByAddress(this.addressInput);
        this.mapLat = pos.Latitude;
        this.mapLong = pos.Longitude;
        this.inputLat = pos.Latitude;
        this.inputLong = pos.Longitude;

        this._changeRef.detectChanges();
        this._onChangeCallback(pos);
    }

    async onFindByCoordinates() {
        this.mapLat = this.inputLat;
        this.mapLong = this.inputLong;

        let pos = new CoordinateModel();
        pos.Latitude = this.inputLat;
        pos.Longitude = this.inputLong;

        this._changeRef.detectChanges();
        this._onChangeCallback(pos);
    }

    private bindSubscribe() {
        this._obsers.push(this._address$.subscribe(x => {
            if (x && x.length > 0)
                this.addressInput = x;
        }));
    }
}
