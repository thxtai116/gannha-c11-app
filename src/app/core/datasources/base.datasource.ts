import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { Observable, BehaviorSubject } from 'rxjs';
import { QueryParamsModel, QueryResultsModel } from '../models/index';
import { BaseModel } from './base.model';
import * as _ from 'lodash';

// Why not use MatTableDataSource?
/*  In this example, we will not be using the built-in MatTableDataSource because its designed for filtering,
	sorting and pagination of a client - side data array.
	Read the article: 'https://blog.angular-university.io/angular-material-data-table/'
**/
export class BaseDataSource implements DataSource<BaseModel> {
    queryParams: QueryParamsModel;
    entitySubject = new BehaviorSubject<any[]>([]);
    entityStoredSubject = new BehaviorSubject<any[]>([]);
    hasItems: boolean = false; // Need to show message: 'No records found

    // Loading | Progress bar
    loadingSubject = new BehaviorSubject<boolean>(false);
    loading$: Observable<boolean>;

    // Paginator | Paginators count
    paginatorTotalSubject = new BehaviorSubject<number>(0);
    paginatorTotal$: Observable<number>;

    constructor() {
        this.loading$ = this.loadingSubject.asObservable();
        this.paginatorTotal$ = this.paginatorTotalSubject.asObservable();
        this.paginatorTotal$.subscribe(res => this.hasItems = res > 0);
    }

    connect(collectionViewer: CollectionViewer): Observable<any[]> {
        // Connecting data source
        return this.entitySubject;
    }

    disconnect(collectionViewer: CollectionViewer): void {
        // Disonnecting data source

        // Stop Disconnecting

        // this.entitySubject.complete();
        // this.loadingSubject.complete();
        // this.paginatorTotalSubject.complete();
    }

    preload(queryParams: QueryParamsModel): void {
        this.queryParams = JSON.parse(JSON.stringify(queryParams));
    }

    baseFilterForServerPagination(_entities: any[], filter: any, _filtrationFields: string[] = []): QueryResultsModel {
        // Filtration
        let entitiesResult = this.searchInArray(_entities, filter, _filtrationFields);

        const queryResults = new QueryResultsModel();

        queryResults.items = entitiesResult;
        queryResults.totalCount = entitiesResult.length;
        queryResults.allItems = _entities;

        return queryResults;
    }

    baseFilter(_entities: any[], _queryParams: QueryParamsModel, _filtrationFields: string[] = []): QueryResultsModel {
        // Filtration
        let entitiesResult = this.searchInArray(_entities, _queryParams.filter, _filtrationFields);

        // Sorting
        // start
        if (_queryParams.sortField) {
            entitiesResult = this.sortArray(entitiesResult, _queryParams.sortField, _queryParams.sortOrder);
        }
        // end

        // Paginator
        // start
        const totalCount = entitiesResult.length;
        const initialPos = _queryParams.pageNumber * _queryParams.pageSize;
        let entitiesStored = entitiesResult;
        entitiesResult = entitiesResult.slice(initialPos, initialPos + _queryParams.pageSize);
        // end

        const queryResults = new QueryResultsModel();
        queryResults.items = entitiesResult;
        queryResults.totalCount = totalCount;
        queryResults.allItems = entitiesStored;
        return queryResults;
    }

    parseToQueryString(queryParams: QueryParamsModel): string {
        let query: string = `page=${queryParams.pageNumber}&limit=${queryParams.pageSize}&sortOrder=${queryParams.sortOrder}&sortField=${queryParams.sortField}`;

        Object.keys(queryParams.filter).forEach(x => {
            query += `&${x}=${queryParams.filter[x]}`;
        });

        return query
    }

    sortArray(_incomingArray: any[], _sortField: string = '', _sortOrder: string = 'asc'): any[] {
        if (!_sortField) {
            return _incomingArray;
        }

        let result: any[] = [];
        result = _incomingArray.sort((a, b) => {
            if (a[_sortField] < b[_sortField]) {
                return _sortOrder === 'asc' ? -1 : 1;
            }

            if (a[_sortField] > b[_sortField]) {
                return _sortOrder === 'asc' ? 1 : -1;
            }

            return 0;
        });
        return result;
    }

    searchInArray(_incomingArray: any[], _queryObj: any, _filtrationFields: string[] = []): any[] {
        const result: any[] = [];
        let resultBuffer: any[] = [];
        const indexes: number[] = [];
        let firstIndexes: number[] = [];
        let doSearch: boolean = false;

        _filtrationFields.forEach(item => {
            if (item in _queryObj) {
                _incomingArray.forEach((element, index) => {
                    if (element[item] === _queryObj[item]) {
                        firstIndexes.push(index);
                    }
                });
                firstIndexes.forEach(element => {
                    resultBuffer.push(_incomingArray[element]);
                });
                _incomingArray = resultBuffer.slice(0);
                resultBuffer = [].slice(0);
                firstIndexes = [].slice(0);
            }
        });

        // Object.keys(_queryObj).forEach(key => {
        //     const searchText = _queryObj[key].toString().trim().toLowerCase();
        //     if (key && !_.includes(_filtrationFields, key) && searchText) {
        //         doSearch = true;
        //         try {
        //             _incomingArray.forEach((element, index) => {
        //                 const _val = element[key].toString().trim().toLowerCase();
        //                 if (_val.indexOf(searchText) > -1 && indexes.indexOf(index) === -1) {
        //                     indexes.push(index);
        //                 }
        //             });
        //         } catch (ex) {
        //             console.log(ex, key, searchText);
        //         }
        //     }
        // });

        _incomingArray.forEach((element, index) => {
            for (let key of Object.keys(_queryObj)) {
                if (typeof _queryObj[key] == "object") {

                    for (let subKey of Object.keys(_queryObj[key])) {
                        const searchText = _queryObj[key][subKey].toString().trim().toLowerCase();

                        if (key && subKey && searchText) {
                            doSearch = true;

                            const _val = element[subKey].toString().trim().toLowerCase();
                            if (_val.indexOf(searchText) > -1) {
                                if (indexes.indexOf(index) === -1) {
                                    indexes.push(index);
                                }
                                break;
                            } else {
                                if (indexes.indexOf(index) !== -1) {
                                    indexes.splice(indexes.indexOf(index));
                                }
                            }
                        }
                    };

                } else if (typeof _queryObj[key] == "string") {
                    const searchText = _queryObj[key].toString().trim().toLowerCase();

                    if (key && searchText) {
                        doSearch = true;

                        const _val = element[key].toString().trim().toLowerCase();
                        if (_val.indexOf(searchText) > -1) {
                            if (indexes.indexOf(index) === -1) {
                                indexes.push(index);
                            }
                        } else {
                            if (indexes.indexOf(index) !== -1) {
                                indexes.splice(indexes.indexOf(index));
                            }
                            break;
                        }
                    }
                } else if (typeof _queryObj[key] == "number") {
                    const filterValue = _queryObj[key];
                    const targetValue = element[key];

                    doSearch = true;

                    if (filterValue === targetValue) {
                        indexes.push(index);
                    }
                }
            };
        });

        // _incomingArray.forEach((element, index) => {
        //     for (let key of Object.keys(_queryObj)) {
        //         const searchText = _queryObj[key].toString().trim().toLowerCase();

        //         if (key && searchText) {
        //             doSearch = true;

        //             const _val = element[key].toString().trim().toLowerCase();
        //             if (_val.indexOf(searchText) > -1) {
        //                 if (indexes.indexOf(index) === -1) {
        //                     indexes.push(index);
        //                 }
        //             } else {
        //                 if (indexes.indexOf(index) !== -1) {
        //                     indexes.splice(indexes.indexOf(index));
        //                 }
        //                 break;
        //             }
        //         }
        //     }
        // })

        if (!doSearch) {
            return _incomingArray;
        }

        indexes.forEach(re => {
            result.push(_incomingArray[re]);
        });

        return result;
    }
}
