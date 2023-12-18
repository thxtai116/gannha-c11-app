import { Injectable } from "@angular/core";

import { environment as env } from "../../../../environments/environment";

import { HttpUtility } from "../../utilities";

import { PlaceModel } from "../../models";

import { PlaceForm } from '../../forms';

@Injectable()

export class PlaceService {
    private _apiEndpoint = env.service.endpoint + '/places';
    private _places: PlaceModel[] = [];

    constructor(
        private _http: HttpUtility
    ) {
    }

    async getAll(reset: boolean = false): Promise<PlaceModel[]> {
        let places: PlaceModel[] = [];

        if (reset) {
            this._places = [];
        }

        if (this._places.length === 0) {
            var result = await this._http.get(this._apiEndpoint);

            if (result) {
                for (let uti of result) {
                    places.push(Object.assign(new PlaceModel(), uti));
                }
            }

            this._places = places;
        }
        else {
            places = this._places;
        }

        return places;
    }

    async get(id: string): Promise<PlaceModel> {
        let url: string = `${this._apiEndpoint}/${id}`
        let result = await this._http.get(url);
        let model = new PlaceModel();

        if (result) {
            model = Object.assign(new PlaceModel(), result)
        }

        return model;
    }

    async generateId(): Promise<string> {
        let result = await this._http.head(this._apiEndpoint);

        return result["UniqueId"] || result["uniqueid"];
    }

    async create(place: PlaceForm) {
        let bodyObj = {
            "Id": place.Id,
            "Name": {
                "vi": place.Name
            },
            "Contact": place.Contact,
            "Latitude": place.Latitude,
            "Longitude": place.Longitude,
            "Timing": {
                "Open": place.Timing.Open,
                "Close": place.Timing.Close,
                "Is24H": place.Timing.Is24H,
                "Specific": place.Timing.Specific,
            }
        };

        let body = JSON.stringify(bodyObj);

        return this._http.post(this._apiEndpoint, body);
    }

    async update(place: PlaceForm) {
        let url: string = `${this._apiEndpoint}/${place.Id}`;
        let bodyObj = {
            "Id": place.Id,
            "Name": {
                "vi": place.Name
            },
            "Contact": place.Contact,
            "Latitude": place.Latitude,
            "Longitude": place.Longitude,
            "Timing": {
                "Open": place.Timing.Open,
                "Close": place.Timing.Close,
                "Is24H": place.Timing.Is24H,
                "Specific": place.Timing.Specific,
            }
        };

        let body = JSON.stringify(bodyObj);

        return this._http.patch(url, body);
    }
}