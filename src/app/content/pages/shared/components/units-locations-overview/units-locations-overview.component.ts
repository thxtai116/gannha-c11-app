import {
    Component,
    OnInit,
    ChangeDetectionStrategy,
    forwardRef,
    ViewChild,
    ElementRef,
    Output,
    EventEmitter,
    ChangeDetectorRef
} from "@angular/core";
import {
    NG_VALUE_ACCESSOR,
    ControlValueAccessor
} from '@angular/forms';
import {
    UnitOverviewViewModel,
} from '../../../../../core/core.module';

declare var H: any;
@Component({
    selector: 'm-units-locations-overview',
    templateUrl: 'units-locations-overview.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => UnitsLocationsOverview),
            multi: true,
        }
    ]
})
export class UnitsLocationsOverview implements OnInit, ControlValueAccessor {

    @Output() onMarkerDetailsSelected: EventEmitter<string> = new EventEmitter<string>();
    @Output() onMarkerLocationSelected: EventEmitter<string> = new EventEmitter<string>();

    private DEFAULT_MAP_ZOOM: number = 5;

    agmMarkers: any[] = [];
    agmMapZoom: number = this.DEFAULT_MAP_ZOOM;
    agmLat: number = 0;
    agmLng: number = 0;

    constructor(
        private _changeRef: ChangeDetectorRef,
    ) { }

    ngOnInit(): void {
        this.setDefaultLocation();
    }

    writeValue(units: UnitOverviewViewModel[]): void {
        if (units && units.length > 0) {
            this.setMarkers(units)
        }
    }

    registerOnChange(fn: any): void { }

    registerOnTouched(fn: any): void { }

    setDisabledState?(isDisabled: boolean): void { }

    onMarkerDetailsClicked(event: any) {
        this.onMarkerDetailsSelected.emit(event);
    }

    onMarkerLocationClicked(event: any) {
        this.onMarkerLocationSelected.emit(event);
    }

    private setDefaultLocation() {
        this.setMapZoom(this.DEFAULT_MAP_ZOOM);
        this.setCenter(16.368559537278433, 107.19255340892244);
    }

    private setMapZoom(value: number) {
        this.agmMapZoom = value;
    }

    private setCenter(lat: number, lng: number) {
        this.agmLat = lat;
        this.agmLng = lng;
    }

    private setMarkers(units: UnitOverviewViewModel[]) {
        this.clearMarkers();

        units.forEach(unit => {
            let marker: any = {
                unitId: unit.Id,
                address: unit.Address,

                lat: unit.Latitude,
                lng: unit.Longitude,
                label: "",
                draggable: false
            }

            this.agmMarkers.push(marker);
        })

        this._changeRef.detectChanges();
    }

    private clearMarkers() {
        this.agmMarkers = [];
    }
}