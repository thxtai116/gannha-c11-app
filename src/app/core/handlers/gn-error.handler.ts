import { ErrorHandler, Injectable } from "@angular/core";
import { environment as env } from "../../../environments/environment";
import { AppInsightsUtility } from "../utilities/index";

@Injectable()

export class GNErrorHandler implements ErrorHandler {
    private _defaultErrorMessage: string = "Lỗi hệ thống. Vui lòng thử lại sau.";

    constructor() { }

    handleError(error) {
        try {
            AppInsightsUtility.instance.trackException(error);

            if (env.production) {
                alert(this._defaultErrorMessage);
            } else {
                alert(error);
            }

            console.log(error);
        } catch (ex) { }
    }
}