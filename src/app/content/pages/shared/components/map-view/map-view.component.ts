import { Component, OnInit, Output, Input, EventEmitter, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { CoordinateModel } from '../../../../../core/models';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'm-map-view',
    templateUrl: './map-view.component.html',
    styleUrls: ['./map-view.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapViewComponent implements OnInit {
    private DEFAULT_MAP_ZOOM: number = 5;
    private LOCATION_MAP_ZOOM: number = 18;

    private _obsers: any[] = [];

    @Input()
    set lat(value) {
        this._lat$.next(value);
    };
    get lat() {
        return this._lat$.getValue();
    }

    @Input()
    set lng(value) {
        this._lng$.next(value);
    };
    get lng() {
        return this._lng$.getValue();
    }

    @Input() info: string;
    @Input() label: string;
    @Input() markerDraggable: boolean = false;
    @Input() clickable: boolean = false;

    @Output() locationChange: EventEmitter<CoordinateModel> = new EventEmitter<CoordinateModel>();

    private _lat$: BehaviorSubject<number> = new BehaviorSubject(null);
    private _lng$: BehaviorSubject<number> = new BehaviorSubject(null);

    agmMarker: any = {
        lat: 0,
        lng: 0,
        label: "",
        draggable: true
    }
    agmMapZoom: number = this.DEFAULT_MAP_ZOOM;

    agmLat: number = 0;
    agmLng: number = 0;

    constructor() { }

    ngOnInit() {
        this.setDefaultLocation();

        this._obsers.push(this._lat$.subscribe(x => {
            if (this.lat !== 0 && this.lng !== 0) {
                this.setLocation();
            }
        }));

        this._obsers.push(this._lng$.subscribe(x => {
            if (this.lat !== 0 && this.lng !== 0) {
                this.setLocation();
            }
        }));
    }

    ngOnDestroy() {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    private setLocation() {
        this.setMapZoom(this.LOCATION_MAP_ZOOM);
        this.setCenter(this.lat, this.lng);
        this.setMarker(this.lat, this.lng);
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

    private setMarker(lat: number, lng: number) {
        let marker: any = {
            lat: lat,
            lng: lng,
            label: "",
            draggable: this.markerDraggable
        }
        this.agmMarker = marker;
    }

    markerDragEnd(marker: any, event) {
        this.setMarker(event.coords.lat, event.coords.lng)

        this.lat = event.coords.lat;
        this.lng = event.coords.lng;

        let location = new CoordinateModel();
        location.Latitude = event.coords.lat;
        location.Longitude = event.coords.lng;
        this.locationChange.emit(location)
    }

    mapClicked(event) {
        if (this.clickable) {
            this.setMarker(event.coords.lat, event.coords.lng)

            this.lat = event.coords.lat;
            this.lng = event.coords.lng;

            let location = new CoordinateModel();
            location.Latitude = event.coords.lat;
            location.Longitude = event.coords.lng;
            this.locationChange.emit(location)
        }
    }
}
