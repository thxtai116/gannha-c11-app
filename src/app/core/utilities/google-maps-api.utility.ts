import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { CoordinateModel } from "../models";
import { environment as env } from "../../../environments/environment";

declare var google: any;

@Injectable()
export class GoogleMapsApiUtility {
    private geocoder: any;

    constructor(
        private http: Http) {
    }

    public async getLatLngByAddress(address: string): Promise<CoordinateModel> {
        if (!this.geocoder) {
            this.geocoder = new google.maps.Geocoder();
        }

        return new Promise<CoordinateModel>((resolve, reject) => {
            this.geocoder.geocode({ 'address': address }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    let location = new CoordinateModel();

                    location.Latitude = results[0].geometry.location.lat();
                    location.Longitude = results[0].geometry.location.lng();
                    resolve(location);
                } else {
                    alert("Không tìm thấy vị trí theo địa chỉ vừa nhập!");

                    resolve(new CoordinateModel());
                }
            });
        });
    }

    public async getAddressByLatlng(lat: number, lng: number) {
        if (lat !== undefined && lng !== undefined) {
            let url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${env.googleKey}`;
            let result = await this.http.get(url).toPromise();
            let json = JSON.parse(result.text());
            if (json.status === "OK" && json.results.length > 0) {
                return json.results[0].formatted_address;
            }
        }
        return "";
    }

    calculateDistance(firstLoc: any, secondLoc: any): number {
        let R = 6378137; // Earth’s mean radius in meter
        let dLat = this.radius(secondLoc.Latitude - firstLoc.Latitude);

        let dLong = this.radius(secondLoc.Longitude - firstLoc.Longitude);

        let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.radius(firstLoc.Latitude)) * Math.cos(this.radius(secondLoc.Latitude)) *
            Math.sin(dLong / 2) * Math.sin(dLong / 2);

        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        let d = R * c;

        return Math.round(d);
    }

    private radius(coordinate): number {
        return coordinate * Math.PI / 180;
    }
}