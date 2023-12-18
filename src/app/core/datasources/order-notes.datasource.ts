import { Observable, of } from 'rxjs';
import { QueryParamsModel, QueryResultsModel, OrderNoteModel } from '../models';
import { tap, catchError, finalize } from 'rxjs/operators';
import { BaseDataSource } from './base.datasource';

export class OrderNotesDataSource extends BaseDataSource {

    private _queryParams;

    constructor() {
        super();
    }

    init(data: Observable<OrderNoteModel[]>, queryParams: QueryParamsModel) {
        this.loadingSubject.next(true);

        this._queryParams = JSON.parse(JSON.stringify(queryParams)) as QueryParamsModel;

        data.pipe(
            tap(res => {
                const result = this.baseFilter(res, this._queryParams, ['status']);
                this.entitySubject.next(result.items);
                this.entityStoredSubject.next(result.allItems);
                this.paginatorTotalSubject.next(result.totalCount);
                this.loadingSubject.next(false);
            }),
            catchError(err => of(new QueryResultsModel([], err))),
            finalize(() => this.loadingSubject.next(false))
        ).subscribe();
    }

    load(data: OrderNoteModel[], queryParams: QueryParamsModel) {
        this.loadingSubject.next(true);

        this._queryParams = JSON.parse(JSON.stringify(queryParams)) as QueryParamsModel;

        const result = this.baseFilter(data, queryParams, ['status']);

        this.entitySubject.next(result.items);
        this.entityStoredSubject.next(result.allItems);
        this.paginatorTotalSubject.next(result.totalCount);

        this.loadingSubject.next(false)
    }
}