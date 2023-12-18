import { Component, OnInit, ChangeDetectionStrategy, Input, ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export class MarkerModel {
    Latitude: number = 0;

    Longitude: number = 0;

    Label: string = "";

    Description: string = "";

    IconUrl: string = "";
}

@Component({
    selector: 'm-map-markers',
    templateUrl: './map-markers.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapMarkersComponent implements OnInit {

    @Input()
    get markers() {
        return this._markers$.getValue();
    }
    set markers(value) {
        this._markers$.next(value);
    }

    private _obsers: any[] = [];
    private _markers$: BehaviorSubject<MarkerModel[]> = new BehaviorSubject<MarkerModel[]>([]);
    private DEFAULT_MAP_ZOOM: number = 5;

    agmMarkers: any[] = [];
    agmMapZoom: number = this.DEFAULT_MAP_ZOOM;
    agmLat: number = 0;
    agmLng: number = 0;

    constructor(
        private _changeRef: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
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

    private bindSubscribes(): void {
        this._obsers.push(
            this._markers$.subscribe(value => {
                if (value) {
                    this.setDefaultLocation();

                    this._changeRef.detectChanges();
                }
            })
        );
    }
}
