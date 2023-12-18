import { Injectable } from '@angular/core';
import { AppInsightsService } from '@markpieszak/ng-application-insights';

@Injectable()

export class AppInsightsUtility {

    static instance: AppInsightsUtility;

    constructor(private appInsightsService: AppInsightsService) {
        AppInsightsUtility.instance = this;
    }

    trackPageView(
        name?: string,
        url?: string,
        properties?: any,
        measurements?: any,
        duration?: number
    ): void {
        this.appInsightsService.trackPageView(name, url, properties, measurements, duration);
    }

    trackEvent(
        name: string,
        properties?: any,
        measurements?: any
    ): void {
        this.appInsightsService.trackEvent(name, properties, measurements);
    };

    trackMetric(
        name: string,
        average: number,
        sampleCount?: number,
        min?: number,
        max?: number,
        properties?: any
    ): void {
        this.appInsightsService.trackMetric(name, average, sampleCount, min, max, properties);
    }

    trackException(
        exception: Error,
        handledAt?: string,
        properties?: any,
        measurements?: any
    ): void {
        this.appInsightsService.trackException(exception, handledAt, properties, measurements);
    }

    trackTrace(
        message: string,
        properties?: any,
        measurements?: any
    ): void {
        this.appInsightsService.trackTrace(message, properties, measurements);
    }

    trackDependency(
        id: string,
        method: string,
        absoluteUrl: string,
        pathName: string,
        totalTime: number,
        success: boolean,
        resultCode: number
    ): void {
        this.appInsightsService.trackDependency(id, method, absoluteUrl, pathName, totalTime, success, resultCode);
    }

    flush() {
        this.appInsightsService.flush();
    }

    setAuthenticatedUserContext(
        authenticatedUserId: string,
        accountId?: string
    ): void {
        this.appInsightsService.setAuthenticatedUserContext(authenticatedUserId, accountId);
    }

    startTrackPage(name?: string) {
        this.appInsightsService.startTrackPage(name);
    }
}

