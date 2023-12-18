import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LocaleString } from "../types/index";

@Injectable()
export class LanguageUtility {
    public Languages: { [key: string]: string } = {
        "Vietnamese": "vi",
        "English": "en"
    }

    private _defaultLang: string = "vi";

    constructor(
        private _translateService: TranslateService) {

    }

    public async getByKey(key?: string): Promise<any> {
        if (key) {
            let result = await this._translateService.get(key).toPromise();

            if (result instanceof Array) result = result[0];

            return result;
        }

        return "";
    }

    public async getLocaleString(text: LocaleString) {
        if (!text) return await this.getByKey("language_unavailable");

        if (!text || !text[this._defaultLang] || text[this._defaultLang].length == 0) {
            return await this.getByKey("language_unavailable");
        }

        return text[this._defaultLang];
    }
}