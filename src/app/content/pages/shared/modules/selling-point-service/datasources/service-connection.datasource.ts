
import { Observable, of } from "rxjs";
import { tap, finalize, catchError } from "rxjs/operators";
import {
    BaseDataSource,

    QueryParamsModel,
    QueryResultsModel
} from "../../../../../../core/core.module";

import { ServiceConnectionViewModel } from "../view-models";

export class ServiceConnectionsDataSource extends BaseDataSource {
    constructor() {
        super();
    }

    init(data: Observable<ServiceConnectionViewModel[]>, queryParams: QueryParamsModel) {
        this.loadingSubject.next(true);

        data.pipe(
            tap(res => {
                const result = this.baseFilter(res, queryParams);
                this.entitySubject.next(result.items);
                this.paginatorTotalSubject.next(result.totalCount);
                this.loadingSubject.next(false);
            }),
            catchError(err => of(new QueryResultsModel([], err))),
            finalize(() => this.loadingSubject.next(false))
        ).subscribe();
    }

    load(data: ServiceConnectionViewModel[], queryParams: QueryParamsModel) {
        this.loadingSubject.next(true);

        const result = this.baseFilter(data, queryParams);

        this.entitySubject.next(result.items);
        this.paginatorTotalSubject.next(result.totalCount);

        this.loadingSubject.next(false)
    }
}