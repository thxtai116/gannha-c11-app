import {
    QueryParamsModel,
    QueryResultsModel
} from "../models/index";

import { BaseDataSource } from "./base.datasource";

import { of, from } from "rxjs";
import { tap, finalize, catchError } from "rxjs/operators";

import { NotificationService } from '../services';

export class NotificationCampaignDataSource extends BaseDataSource {
    private _result: QueryResultsModel = new QueryResultsModel();

    constructor(
        private _notificationService: NotificationService) {
        super();
    }

    load(queryParams: QueryParamsModel) {
        this.loadingSubject.next(true);

        from(this._notificationService.getAll(queryParams.pageNumber, queryParams.pageSize)).pipe(
            tap(res => {
                this._result = JSON.parse(JSON.stringify(res)) as QueryResultsModel;

                this.entitySubject.next(this._result.items);

                this.paginatorTotalSubject.next(this._result.totalCount);
            }),
            catchError(err => of(new QueryResultsModel([], err))),
            finalize(() => this.loadingSubject.next(false))
        ).subscribe();
    }

    filter(filter: any = {}) {
        const result = this.baseFilterForServerPagination(this._result.items, filter);

        this.entitySubject.next(result.items);
    }
}