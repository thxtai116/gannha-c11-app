import { Injectable } from '@angular/core';

import {
    HttpUtility,
    StorageUtility
} from "../../utilities/index";

import { AdministrativeModel } from "../../models/index";

import { AdministrativeType } from "../../enums/index";

import { LocalStorageKey } from "../../consts/index";

import { environment as env } from "../../../../environments/environment";
import { LanguagePipe } from '../../pipes';

@Injectable()
export class AreaService {
    private apiEndpoint = env.service.endpoint + '/areas';

    constructor(
        private _http: HttpUtility,
        private _storageUtil: StorageUtility,
    ) {
    }

    async getCountries(): Promise<AdministrativeModel[]> {
        let storage = this._storageUtil.get(LocalStorageKey.countries);
        let countries: AdministrativeModel[] = [];
        let cacheCountries: AdministrativeModel[] = [];

        cacheCountries = !storage || storage.length === 0 ? [] : JSON.parse(storage);

        if (!cacheCountries || cacheCountries.length === 0) {
            let result = await this.getAreas(AdministrativeType.Country);

            if (result) {
                for (let country of result) {
                    countries.push(Object.assign(new AdministrativeModel(), country));
                }

                countries.sort(this.compareString);

                this._storageUtil.set(LocalStorageKey.countries, JSON.stringify(countries));
            }
        } else {
            countries = cacheCountries;
        }

        return countries;
    }

    async getProvinces(id: string = "596840b0c09b5e6a28433715"): Promise<AdministrativeModel[]> {
        let storage = this._storageUtil.get(LocalStorageKey.provinces);
        let provinces: AdministrativeModel[] = [];
        let cacheProvinces: AdministrativeModel[] = [];
        let countryProvinces: AdministrativeModel[] = [];

        cacheProvinces = !storage || storage.length === 0 ? [] : JSON.parse(storage);

        if (!cacheProvinces || cacheProvinces.length === 0) {
            let result = await this.getAreas(AdministrativeType.Province, id);

            for (let province of result) {
                province.ParentId = id;
                provinces.push(Object.assign(new AdministrativeModel(), province));
            }
            this._storageUtil.set(LocalStorageKey.provinces, JSON.stringify(provinces));
        }
        else {
            countryProvinces = cacheProvinces.filter(x => x.ParentId === id);
            if (countryProvinces.length > 0) {
                provinces = countryProvinces;
            } else {
                let result = await this.getAreas(AdministrativeType.Province, id);

                for (let province of result) {
                    province.ParentId = id;
                    provinces.push(Object.assign(new AdministrativeModel(), province));
                    cacheProvinces.push(Object.assign(new AdministrativeModel(), province));
                }
                this._storageUtil.set(LocalStorageKey.provinces, JSON.stringify(provinces));
            }
        }

        provinces.sort(this.compareString);

        return provinces;
    }

    async getDistricts(id: string): Promise<AdministrativeModel[]> {
        let storage = this._storageUtil.get(LocalStorageKey.districts);
        let districts: AdministrativeModel[] = [];
        let cacheDistricts: AdministrativeModel[] = [];
        let provinceDistricts: AdministrativeModel[] = [];

        cacheDistricts = !storage || storage.length === 0 ? [] : JSON.parse(storage);

        if (!cacheDistricts || cacheDistricts.length === 0) {
            let result = await this.getAreas(AdministrativeType.District, id);

            for (let district of result) {
                district.ParentId = id;
                districts.push(Object.assign(new AdministrativeModel(), district));
            }
            this._storageUtil.set(LocalStorageKey.districts, JSON.stringify(districts));
        }
        else {
            provinceDistricts = cacheDistricts.filter(x => x.ParentId === id);
            if (provinceDistricts.length > 0) {
                districts = provinceDistricts;
            } else {
                let result = await this.getAreas(AdministrativeType.District, id);

                for (let district of result) {
                    district.ParentId = id;
                    districts.push(Object.assign(new AdministrativeModel(), district));
                    cacheDistricts.push(Object.assign(new AdministrativeModel(), district));
                }
                this._storageUtil.set(LocalStorageKey.districts, JSON.stringify(districts));
            }
        }

        districts.sort(this.compareString);
        return districts;
    }

    async getWards(id: string): Promise<AdministrativeModel[]> {
        let storage = this._storageUtil.get(LocalStorageKey.wards);
        let wards: AdministrativeModel[] = [];
        let cacheWards: AdministrativeModel[] = [];
        let districtWards: AdministrativeModel[] = [];

        cacheWards = !storage || storage.length === 0 ? [] : JSON.parse(storage);

        if (!cacheWards || cacheWards.length === 0) {
            let result = await this.getAreas(AdministrativeType.Ward, id);

            for (let ward of result) {
                ward.ParentId = id;
                wards.push(Object.assign(new AdministrativeModel(), ward));
            }
            this._storageUtil.set(LocalStorageKey.wards, JSON.stringify(wards));
        }
        else {
            districtWards = cacheWards.filter(x => x.ParentId === id);
            if (districtWards.length > 0) {
                wards = districtWards;
            } else {
                let result = await this.getAreas(AdministrativeType.Ward, id);

                for (let ward of result) {
                    ward.ParentId = id;
                    wards.push(Object.assign(new AdministrativeModel(), ward));
                    cacheWards.push(Object.assign(new AdministrativeModel(), ward));
                }
                this._storageUtil.set(LocalStorageKey.wards, JSON.stringify(wards));
            }
        }

        wards.sort(this.compareString);
        return wards;
    }

    async getAdministrationFromAddress(address: string = ""): Promise<any> {
        let url = `${this.apiEndpoint}/address`;
        let body = JSON.stringify({
            "Address": address
        });

        return this._http.post(url, body);
    }

    private async getAreas(type: AdministrativeType, id: string = ""): Promise<AdministrativeModel[]> {
        let data: AdministrativeModel[] = [];
        let url = `${this.apiEndpoint}?level=${type}`;

        if (id !== "") {
            url += `&id=${id}`;
        }

        let result: any[] = await this._http.get(url);

        if (result) {
            for (let area of result) {
                data.push(Object.assign(new AdministrativeModel(), area));
            }
        }

        return data;
    }

    private compareString(firstElem, lastElem) {
        let firstName = new LanguagePipe().transform(firstElem.Name);
        let lastName = new LanguagePipe().transform(lastElem.Name);

        if (firstName < lastName) return -1;
        if (firstName > lastName) return 1;

        return 0;
    }
}