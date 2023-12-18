import { Injectable } from "@angular/core";
import { OAuthService, AuthConfig, JwksValidationHandler } from "angular-oauth2-oidc";

import { environment as env } from '../../../../environments/environment';

import { filter } from 'rxjs/operators';

import { AppInsightsUtility } from '../../utilities/app-insights.utility';

@Injectable()
export class AuthService {
    private logoutEndApiEndpoint = env.oauth.logoutUrl;
    private redirectLogoutUri = env.oauth.redirectUri;
    private _events: string[] = ['token_received', 'token_error', 'token_refresh_error', 'silent_refresh_error', 'silently_refreshed', 'silent_refresh_timeout', 'token_expires'];

    authenticated: boolean = false;

    private _authConfig: AuthConfig = {
        issuer: env.oauth.issuer,
        redirectUri: env.oauth.redirectUri,
        clientId: env.oauth.clientId,
        scope: env.oauth.scope,
        loginUrl: env.oauth.loginUrl,
        requireHttps: false,
        oidc: false,
        silentRefreshRedirectUri: env.oauth.silentRefreshRedirectUri,
        silentRefreshShowIFrame: false,
        silentRefreshIFrameName: "sr-iframe",
        silentRefreshTimeout: 5000,
        clearHashAfterLogin: true,
    };

    constructor(
        private oAuthService: OAuthService,
        private _appInsightUtil: AppInsightsUtility) {
    }

    init() {
        this.oAuthService.configure(this._authConfig);
        this.oAuthService.tokenValidationHandler = new JwksValidationHandler();

        this.oAuthService.setupAutomaticSilentRefresh();
        this.oAuthService.setStorage(localStorage);

        this.trackEvents();
    }

    hasValidAccessToken() {
        return this.oAuthService.hasValidAccessToken();
    }

    initImplicitFlow() {
        this.oAuthService.initImplicitFlow();
    }

    getAccessToken() {
        return this.oAuthService.getAccessToken();
    }

    tryLogin(options: any): Promise<any> {
        return this.oAuthService.tryLogin(options);
    }

    logout(): string {
        this.oAuthService.logOut();

        return this.logoutEndApiEndpoint + "?client_id=" + this.oAuthService.clientId + "&scheme=oidc&returnUrl=" + this.redirectLogoutUri;
    }

    private trackEvents(): void {
        this.oAuthService.events.pipe(filter(e => this._events.indexOf(e.type) > -1)).subscribe(e => {
            let props: any = {
                type: e.type
            };

            this._appInsightUtil.trackEvent("TokenEvents", props);
        });
    }
}
