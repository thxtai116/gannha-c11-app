import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { HttpClient, HttpRequest, HttpResponse, HttpHeaders, HttpEvent } from '@angular/common/http';

import { RoutePath, LocalStorageKey } from "../consts/index";

import { HttpResponseBody, ErrorModel } from "../models/index";

import { environment as env } from "../../../environments/environment";

import { AppInsightsUtility } from "./app-insights.utility";

import { StorageUtility } from "./storage.utility";

import { AuthService } from "../services/business/auth.service";

@Injectable()

export class HttpUtility {
    private _lock: boolean = false;

    constructor(
        private _http: HttpClient,
        private _router: Router,
        private _authService: AuthService,
        private _appInsightsUtil: AppInsightsUtility,
        private _storageUtil: StorageUtility
    ) {
    }

    get(url: string, headers?: HttpHeaders): Promise<any> {
        return this.request("GET", url, null, headers);
    }

    delete(url: string, headers?: HttpHeaders): Promise<any> {
        return this.request("DELETE", url, null, headers);
    }

    head(url: string, headers?: HttpHeaders): Promise<any> {
        return this.request("HEAD", url, null, headers);
    }

    post(url: string, body: any, headers?: HttpHeaders): Promise<any> {
        return this.request("POST", url, body, headers);
    }

    postForm(url: string, body: any, headers?: HttpHeaders, custom?: boolean): Promise<any> {
        return this.request("POST", url, body, headers, custom);
    }

    put(url: string, body?: any, headers?: HttpHeaders): Promise<any> {
        return this.request("PUT", url, body, headers);
    }

    putUploadVideo(url: string, body: any, headers: HttpHeaders): Promise<any> {
        var req = new HttpRequest("PUT", url, body, {
            headers: headers,
        })

        return this._http.request(req).toPromise()
            .then(res => {
                return { data: null, successful: true }
            })
            .catch(res => {
                return this.handleError(req, res);
            });
    }

    patch(url: string, body: any, headers?: HttpHeaders): Promise<any> {
        return this.request("PATCH", url, body, headers);
    }

    request(method: string, url: string, body?: any, headers?: HttpHeaders, custom?: boolean): Promise<any> {
        var req = new HttpRequest(method, url, body, {
            headers: custom ? this.addFormHeaders(headers) : this.addDefaultHeaders(headers),
            withCredentials: true
        })

        return this._http.request(req).toPromise()
            .then(res => {
                return this.extractData(req, res);
            })
            .catch(res => {
                return this.handleError(req, res);
            });
    }

    private addDefaultHeaders(headers?: HttpHeaders): HttpHeaders {
        headers = headers || new HttpHeaders();

        headers = headers.append('Authorization', `Bearer ${this._storageUtil.get(LocalStorageKey.accessToken)}`);
        headers = headers.append('Content-Type', `application/json`);
        headers = headers.append('X-Device-Id', `123456789`);
        headers = headers.append('Multi-Language', 'true');
        headers = headers.append('X-Coordinates-Latitude', '10.7770953');
        headers = headers.append('X-Coordinates-Longitude', '106.6983776');

        return headers;
    }

    private addFormHeaders(headers?: HttpHeaders): HttpHeaders {
        headers = headers || new HttpHeaders();

        headers = headers.append('Authorization', `Bearer ${this._storageUtil.get(LocalStorageKey.accessToken)}`);
        headers = headers.append('X-Device-Id', `123456789`);
        headers = headers.append('Multi-Language', 'true');

        return headers;
    }

    private extractData(req: HttpRequest<any>, res: HttpEvent<any>): any {
        var httpRes = res as HttpResponse<any>;
        var body = httpRes.body;

        if (req.method === "HEAD") {
            body = {};
            body["data"] = {};

            for (let key of httpRes.headers.keys()) {
                body.data[key] = httpRes.headers.get(key);
            }
        } else {
            if (!httpRes.body.successful) {
                alert(`Error Code: ${httpRes.body.errorCode}. Error Description: ${httpRes.body.errorDescription}`);

                this.trackException(httpRes);
            }
        }

        return body.data || {};
    }

    private trackException(res: HttpResponse<any>) {
        let httpError = new ErrorModel();
        let properties = {
            Url: res.url,
            ErrorCode: res.body.errorCode,
            Description: res.body.errorDescription
        }
        this._appInsightsUtil.trackException(httpError, res.url, properties);
    }

    private handleError(req: HttpRequest<any> | any, res: HttpResponse<any> | any) {
        let errMsg: string;

        console.log(res);

        switch (res.status) {
            case 400:
                if (res.error.errorDescription && res.error.errorDescription.length > 0) {
                    errMsg = res.error.errorDescription;
                } else if (res.error.errorMessage && res.error.errorMessage._message) {
                    errMsg = res.error.errorMessage._message;
                } else {
                    errMsg = "Hệ thống vừa xảy ra lỗi. Vui lòng thử lại sau.";
                }

                if (errMsg) {
                    alert(errMsg);
                }

                break;

            case 401:
                this.unauthorizedErrorHandler();
                break;

            case 403:
                this.forbiddenErrorHandler();
                break;

            default:
                this.internalErrorHanlder();
                break;
        }
    }

    private unauthorizedErrorHandler() {
        if (!this._authService.authenticated || !this._authService.hasValidAccessToken()) {
            console.log("Unauthorized Error");
            this._authService.initImplicitFlow();
        } else {
            if (this._lock) return;

            this._lock = true;

            this._authService.initImplicitFlow();
        }
    }

    private forbiddenErrorHandler() {
        console.log("Forbidden Error");

        alert("Bạn không có quyền thực hiện tao tác này.");
    }

    private internalErrorHanlder() {
        console.log("Internal Error");

        alert("Hệ thống vừa xảy ra lỗi. Vui lòng thử lại sau.");
        // this._router.navigate([RoutePath.internalError]);
    }
}