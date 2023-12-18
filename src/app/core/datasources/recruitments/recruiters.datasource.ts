import { Injectable } from '@angular/core';

import { of, from } from "rxjs";
import { tap, finalize, catchError } from "rxjs/operators";

import {
    QueryParamsModel,
    QueryResultsModel
} from "../../models/index";

import { BaseDataSource } from "../base.datasource";

import { RecruiterService } from '../../services';

@Injectable()
export class RecruitersDataSource extends BaseDataSource {
    private _result: QueryResultsModel = new QueryResultsModel();

    constructor(
        private _recruiterService: RecruiterService,
    ) {
        super();
    }

    load(queryParams: QueryParamsModel) {
        this.preload(queryParams);

        this.loadingSubject.next(true);

        from(this._recruiterService.getAll(queryParams.pageNumber, queryParams.pageSize)).pipe(
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