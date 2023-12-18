import {
    QueryParamsModel,
    QueryResultsModel
} from "../models/index";

import { BaseDataSource } from "./base.datasource";

import { OrderService } from '../services';

import { of, from } from "rxjs";
import { tap, finalize, catchError } from "rxjs/operators";

export class OrdersDataSource extends BaseDataSource {
    private _result: QueryResultsModel = new QueryResultsModel();

    constructor(
        private _orderService: OrderService
    ) {
        super();
    }

    load(queryParams: QueryParamsModel) {
        this.loadingSubject.next(true);

        from(this._orderService.getByBrand(this.parseToQueryString(queryParams))).pipe(
            tap(res => {
                this.entitySubject.next(res.items);

                this.paginatorTotalSubject.next(res.totalCount);
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