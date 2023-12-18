
import { Observable, of } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';

import { BaseDataSource } from './base.datasource';
import { QueryParamsModel } from '../models/query-models/query-params.model';
import { QueryResultsModel } from '../models/query-models/query-results.model';

export class CommonDatasource extends BaseDataSource {
    private _queryParams;

    constructor(
    ) {
        super();
    }

    init(data: Observable<any[]>, queryParams: QueryParamsModel) {
        this.loadingSubject.next(true);

        this._queryParams = JSON.parse(JSON.stringify(queryParams)) as QueryParamsModel;

        data.pipe(
            tap(res => {
                const result = this.baseFilter(res, this._queryParams);

                this.entitySubject.next(result.items);
                this.entityStoredSubject.next(result.allItems);
                this.paginatorTotalSubject.next(result.totalCount);
                this.loadingSubject.next(false);
            }),
            catchError(err => of(new QueryResultsModel([], err))),
            finalize(() => this.loadingSubject.next(false))
        ).subscribe();
    }

    load(data: any[], queryParams: QueryParamsModel) {
        this.loadingSubject.next(true);

        this._queryParams = JSON.parse(JSON.stringify(queryParams)) as QueryParamsModel;

        const result = this.baseFilter(data, queryParams);

        this.entitySubject.next(result.items);
        this.entityStoredSubject.next(result.allItems);
        this.paginatorTotalSubject.next(result.totalCount);

        this.loadingSubject.next(false)
    }
}