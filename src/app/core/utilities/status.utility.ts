import { Status, StatusType } from "../enums/index";
import { LanguageUtility } from "./language.utility";

export class StatusUtility {
    constructor(private _langUtil: LanguageUtility) { }

    async getText(status: Status, type: StatusType): Promise<string> {
        let text: string = "";

        switch (type) {
            case StatusType.SellingPoint: {
                text = await this.getSellingPointText(status);
                break;
            }
            default: {
                text = await this.getDefaultText(status);
                break;
            }
        }

        return text;
    }

    getClass(status: Status): string {
        let htmlClass = "";

        switch (status) {
            case Status.Active:
                htmlClass = "status-active";
                break;

            case Status.Deactive:
                htmlClass = "status-deactive";
                break;

            case Status.Expired:
                htmlClass = "status-expired";
                break;

            case Status.Pending:
                htmlClass = "status-pending";
                break;
        }

        return htmlClass;
    }

    private async getDefaultText(status: Status): Promise<string> {
        let text: string = "";

        switch (status) {
            case Status.Active: {
                text = await this._langUtil.getByKey("active");
                break;
            }
            case Status.Deactive: {
                text = await this._langUtil.getByKey("deactive");
                break;
            }
            case Status.Expired: {
                text = await this._langUtil.getByKey("expired");
                break;
            }
            case Status.Pending: {
                text = await this._langUtil.getByKey("pending");
                break;
            }
        }

        return text;
    }

    private async getSellingPointText(status: Status): Promise<string> {
        let text: string = "";

        switch (status) {
            case Status.Active: {
                text = await this._langUtil.getByKey("running_selling_points");
                break;
            }
            case Status.Deactive: {
                text = await this._langUtil.getByKey("deactive_selling_points");
                break;
            }
            case Status.Expired: {
                text = await this._langUtil.getByKey("expired_selling_points");
                break;
            }
            case Status.Pending: {
                text = await this._langUtil.getByKey("pending_selling_points");
                break;
            }
        }

        return text;
    }
}