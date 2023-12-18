import {
    QueryParamsModel,
    QueryResultsModel
} from "../models/index";

import { TenantOverviewViewModel } from "../view-models/index";

import { BaseDataSource } from "./base.datasource";

import { Observable, of } from "rxjs";
import { tap, finalize, catchError } from "rxjs/operators";

export class TenantsDataSource extends BaseDataSource {
    private _queryParams;

    constructor() {
        super();
    }

    init(data: Observable<TenantOverviewViewModel[]>, queryParams: QueryParamsModel) {
        this.loadingSubject.next(true);

        this._queryParams = JSON.parse(JSON.stringify(queryParams)) as QueryParamsModel;

        data.pipe(
            tap(res => {
                const result = this.baseFilter(res, this._queryParams, ['status']);
                this.entitySubject.next(result.items);
                this.paginatorTotalSubject.next(result.totalCount);
                this.loadingSubject.next(false);
            }),
            catchError(err => of(new QueryResultsModel([], err))),
            finalize(() => this.loadingSubject.next(false))
        ).subscribe();
    }

    load(data: TenantOverviewViewModel[], queryParams: QueryParamsModel) {
        this.loadingSubject.next(true);

        this._queryParams = JSON.parse(JSON.stringify(queryParams)) as QueryParamsModel;

        const result = this.baseFilter(data, queryParams, ['status']);

        this.entitySubject.next(result.items);
        this.paginatorTotalSubject.next(result.totalCount);

        this.loadingSubject.next(false)
    }
}