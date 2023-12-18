import { Injectable } from '@angular/core';

import { environment as env } from '../../../../environments/environment';

import { HttpUtility, DateTimeUtility } from "../../utilities/index";

import {
    BrandModel,
    UnitModel,
    SellingPointModel,
    GnServiceConfigModel,
    UserInfoModel,
    BrandFindResultModel,
    ButtonOptionModel,
} from "../../models/index";

import { OpenServiceConfigurationForm } from '../../forms';

@Injectable()

export class BrandService {
    private _apiEndpoint = env.service.endpoint + '/brands';
    private _passportEndpoint = env.service.passport;
    private _brandsShort: BrandModel[] = [];

    constructor(
        private _http: HttpUtility,
        private _dateTimeUtil: DateTimeUtility
    ) {
    }

    // Get

    async getByIds(ids: string[]): Promise<BrandModel[]> {
        let models: BrandModel[] = [];
        let result = await this.getAllShort();

        models = result.filter(x => ids.indexOf(x.Id) > -1);

        return models;
    }

    async getAllShort(reset: boolean = false): Promise<BrandModel[]> {
        let brands: BrandModel[] = [];
        let url = `${this._apiEndpoint}`;

        if (reset) {
            this._brandsShort = [];
        }

        if (this._brandsShort.length === 0) {
            var result = await this._http.get(url);

            if (result) {
                for (let cat of result) {
                    brands.push(Object.assign(new BrandModel(), cat));
                }
            }

            this._brandsShort = brands;
        }
        else {
            brands = this._brandsShort;
        }

        return brands;
    }

    async getAll(categoryId: string = null): Promise<BrandModel[]> {
        let url = !categoryId || categoryId === "All" ? `${this._apiEndpoint}` : `${this._apiEndpoint}?categoryId=${categoryId}`
        let brands: BrandModel[] = [];
        let results: any[] = await this._http.get(url);

        if (results) {
            for (let brand of results) {
                brands.push(Object.assign(new BrandModel(), brand));
            }
        }

        return brands;
    }

    async findByIds(ids: string[], roles: string[]): Promise<BrandFindResultModel[]> {
        let brands: BrandFindResultModel[] = [];
        let url = `${this._apiEndpoint}/find`;

        let bodyObj = {
            'Brands': ids,
            'Roles': roles,
        };

        let body = JSON.stringify(bodyObj);

        var result = await this._http.post(url, body);

        if (result) {
            for (let brand of result) {
                brands.push(Object.assign(new BrandFindResultModel(), brand));
            }
        }

        return brands;
    }

    async get(id: string): Promise<BrandModel> {
        let brand = new BrandModel();
        let url = `${this._apiEndpoint}/${id}`;
        let result = await this._http.get(url);

        if (result) {
            brand = Object.assign(new BrandModel(), result);

            if (!brand.SellingPoint.Options) {
                brand.SellingPoint.Options = {
                    AppointmentButton: new ButtonOptionModel(),
                    ShareButton: new ButtonOptionModel()
                };

                brand.SellingPoint.Options.AppointmentButton.Label = {
                    vi: "be Here",
                    en: "be Here"
                };

                brand.SellingPoint.Options.ShareButton.Label = {
                    vi: "Chia sẻ",
                    en: "Sharing"
                };
            }
        }

        return brand;
    }

    async getUnits(id: string): Promise<UnitModel[]> {
        let units: UnitModel[] = [];
        let url = `${this._apiEndpoint}/${id}/units`;
        let results: any[] = await this._http.get(url);

        if (results) {
            for (let unit of results) {
                units.push(Object.assign(new UnitModel(), unit));
            }
        }

        return units;
    }

    async getSellingPoints(id: string): Promise<SellingPointModel[]> {
        let sps: SellingPointModel[] = [];
        let url = `${this._apiEndpoint}/${id}/sellingpoints`;
        let results: any[] = await this._http.get(url);

        if (results) {
            for (let sp of results) {
                sps.push(Object.assign(new SellingPointModel(), sp));
            }
        }

        return sps;
    }

    public async getSupervisors(id: string): Promise<UserInfoModel[]> {
        let url = `${this._apiEndpoint}/${id}/supervisors`;
        let results: any[] = await this._http.get(url);
        let supervisors: UserInfoModel[] = [];

        if (results) {
            for (let sp of results) {
                supervisors.push(Object.assign(new UserInfoModel(), sp));
            }
        }

        return supervisors;
    }

    // Create

    async generateId(): Promise<string> {
        let result = await this._http.head(this._apiEndpoint);

        let uniqueId = result["UniqueId"] || result["uniqueid"];

        return uniqueId;
    }

    public createBrand(brand: BrandModel, tenantId: string, userId: string) {
        let languages = Object.keys(brand.Name);
        for (let lang of languages) {
            if (brand.Name[lang] == "") {
                delete brand.Name[lang];
                delete brand.Description[lang];
                delete brand.SellingPoint.Title[lang];
                delete brand.SellingPoint.FullTitle[lang];
                delete brand.SellingPoint.Description[lang];
            }
        }
        let bodyObj = {
            'Brand': {
                'Id': brand.Id,
                'Name': brand.Name,
                'Description': brand.Description,
                'SellingPoint': {
                    'Title': brand.SellingPoint.Title,
                    'FullTitle': brand.SellingPoint.FullTitle,
                    'Description': brand.SellingPoint.Description,
                    'Gallery': brand.SellingPoint.Gallery.filter(x => x.Url.length > 0) || [],
                    Options: brand.SellingPoint.Options,
                },
                'Contact': brand.Contact,
                'Categories': brand.Categories,
                'Logo': brand.Logo,
                'Marker': brand.Marker,
                'Background': brand.Background,
                'Gallery': brand.Gallery.filter(x => x.Url.length > 0) || [],
                'Tags': brand.Tags,
                'Utilities': brand.Utilities,
                "Timing": {
                    "Open": brand.Timing.Open,
                    "Close": brand.Timing.Close,
                    "Is24H": brand.Timing.Is24H,
                    "Specific": brand.Timing.Specific,
                },
            },
            'OrgId': tenantId,
            'UserId': userId,
            'Properties': brand.Properties
        };

        let body = JSON.stringify(bodyObj);

        return this._http.post(this._apiEndpoint, body);
    }

    // Update Info

    deactivate(id: string) {
        let url = `${this._apiEndpoint}/${id}`;

        let body = JSON.stringify({
            "Status": "Deactive"
        });

        return this._http.put(url, body);
    }

    activate(id: string) {
        let url = `${this._apiEndpoint}/${id}`;

        let body = JSON.stringify({
            "Status": "Active"
        });

        return this._http.put(url, body);
    }
    updateBrandBasicInfo(brand: BrandModel) {
        var url = `${this._apiEndpoint}/${brand.Id}`;
        let bodyObj = {
            'Name': brand.Name,
            'Description': brand.Description,
            'Logo': brand.Logo,
            'Marker': brand.Marker,
            'Background': brand.Background,
            'Gallery': brand.Gallery.filter(x => x.Url.length > 0) || [],
            'Tags': brand.Tags,
            'Utilities': brand.Utilities,
            'Contact': brand.Contact,
            'Categories': brand.Categories,
            'Timing': {
                "Open": brand.Timing.Open,
                "Close": brand.Timing.Close,
                "Is24H": brand.Timing.Is24H,
                "Specific": brand.Timing.Specific,
            },
            'Properties': brand.Properties
        };

        let body = JSON.stringify(bodyObj);

        return this._http.patch(url, body);
    }

    partialUpdateBrandBasicInfo(brand: BrandModel) {
        var url = `${this._apiEndpoint}/${brand.Id}`;
        let bodyObj = {
            'Name': brand.Name,
            'Description': brand.Description,
            'Logo': brand.Logo,
            'Marker': brand.Marker,
            'Background': brand.Background,
            'Gallery': brand.Gallery.filter(x => x.Url.length > 0) || [],
            'Tags': brand.Tags,
            'Utilities': brand.Utilities,
            'Contact': brand.Contact,
            'Timing': {
                "Open": brand.Timing.Open,
                "Close": brand.Timing.Close,
                "Is24H": brand.Timing.Is24H,
                "Specific": brand.Timing.Specific,
            }
        };

        let body = JSON.stringify(bodyObj);

        return this._http.patch(url, body);
    }

    updateBrandDefaultSP(brand: BrandModel) {
        var url = `${this._apiEndpoint}/${brand.Id}`;
        let bodyObj = {
            SellingPoint: {
                Title: brand.SellingPoint.Title,
                FullTitle: brand.SellingPoint.FullTitle,
                Description: brand.SellingPoint.Description,
                Gallery: brand.SellingPoint.Gallery.filter(x => x.Url.length > 0) || [],
                Options: brand.SellingPoint.Options,
            },
            Actions: brand.Actions ? brand.Actions : [],
            Gallery: brand.Gallery.filter(x => x.Url.length > 0) || []
        };

        let body = JSON.stringify(bodyObj);
        return this._http.patch(url, body);
    }

    // Service Configuration

    async getServiceConfigs(id: string): Promise<GnServiceConfigModel[]> {
        let configs: GnServiceConfigModel[] = [];
        let url = `${this._apiEndpoint}/${id}/connect/services`;
        let results: any[] = await this._http.get(url);

        if (results) {
            for (let config of results) {
                configs.push(Object.assign(new GnServiceConfigModel(), config));
            }
        }

        return configs;
    }

    //SwitchBrand

    switchBrand(brandId: string): Promise<any> {
        let url = `${this._passportEndpoint}/tenant/switch/brand`;
        let bodyObj = {
            "Id": brandId
        };
        let body = JSON.stringify(bodyObj);

        return this._http.post(url, body);
    }
}