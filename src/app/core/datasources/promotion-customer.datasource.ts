import {
    QueryParamsModel,
    QueryResultsModel
} from "../models/index";

import { PromotionCustomerViewModel } from "../view-models/index";

import { BaseDataSource } from "./base.datasource";

import { Observable, of } from "rxjs";
import { tap, finalize, catchError } from "rxjs/operators";

export class PromotionCustomerDataSource extends BaseDataSource {
    private _queryParams;

    constructor() {
        super();
    }

    init(data: Observable<PromotionCustomerViewModel[]>, queryParams: QueryParamsModel) {
        this.loadingSubject.next(true);

        this._queryParams = JSON.parse(JSON.stringify(queryParams)) as QueryParamsModel;

        data.pipe(
            tap(res => {
                const result = this.baseFilter(res, this._queryParams);
                this.entitySubject.next(result.items);
                this.paginatorTotalSubject.next(result.totalCount);
                this.loadingSubject.next(false);
            }),
            catchError(err => of(new QueryResultsModel([], err))),
            finalize(() => this.loadingSubject.next(false))
        ).subscribe();
    }

    load(data: PromotionCustomerViewModel[], queryParams: QueryParamsModel) {
        this.loadingSubject.next(true);

        this._queryParams = JSON.parse(JSON.stringify(queryParams)) as QueryParamsModel;

        const result = this.baseFilter(data, queryParams);

        this.entitySubject.next(result.items);
        this.paginatorTotalSubject.next(result.totalCount);

        this.loadingSubject.next(false)
    }
}