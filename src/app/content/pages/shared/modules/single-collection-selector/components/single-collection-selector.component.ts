import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ElementRef, Inject } from '@angular/core';
import { MatPaginator, MatSort, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { BehaviorSubject, merge, fromEvent } from 'rxjs';
import { tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import {
    CollectionsDataSource,

    CollectionOverviewViewModel,
    CollectionModel,
    QueryParamsModel,

    CollectionService,
    CollectionTransformer,
} from '../../../../../../core/core.module';

@Component({
    selector: 'm-single-collection-selector',
    templateUrl: './single-collection-selector.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SingleCollectionSelectorComponent implements OnInit {

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild('searchInput', { static: true }) searchInput: ElementRef;

    private _obsers: any[] = [];

    lang: string = "vi";

    viewFilter: any = {
        filterStatus: "2"
    };

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false)
    };

    viewData: any = {
        displayedColumns: ["Select", "Title", "StartDate", "EndDate", "Status"],
        dataSource: new CollectionsDataSource(),
        selectedCollection: new CollectionOverviewViewModel(),
        collections: new Array<CollectionModel>(),
        collections$: new BehaviorSubject<CollectionOverviewViewModel[]>([]),
        collectionsResult: new Array<CollectionOverviewViewModel>(),
        collectionsStored: new Array<CollectionOverviewViewModel>()
    }

    constructor(
        private _collectionService: CollectionService,
        private _collectionTransformer: CollectionTransformer,
        public dialogRef: MatDialogRef<SingleCollectionSelectorComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
    }

    ngOnInit() {
        this.viewControl.loading$ = this.viewData.dataSource.loadingSubject;
        this.viewControl.loading$.next(true);

        this.parseInjectionData(this.data);
        this.init();

        this.bindSubscribes();
    }

    private parseInjectionData(data: any) {
        this.viewFilter.filterStatus = data.filter['status-collection'] || "";
        this.searchInput.nativeElement.value = data.filter['text-collection'] || "";
    }

    refresh(): void {
        this.viewControl.loading$.next(true);

        Promise.all([
            this._collectionService.getAll(),
        ]).then(value => {
            this.viewData.collections = value[0];

            let vms = value[0].map(x => this._collectionTransformer.toCollectionOverview(x));

            this.viewData.collections$.next(vms);
        }).finally(() => {
            this.viewControl.loading$.next(false);
        });
    }

    onStatusSelect(): void {
        this.loadCollections();
    }

    onCancelClick(): void {
        this.dialogRef.close({
            filter: {
                'status-collection': this.viewFilter.filterStatus,
                'text-collection': this.searchInput.nativeElement.value
            }
        });
    }

    onSubmit(): void {
        let model = this.viewData.collections.find(x => x.Id === this.viewData.selectedCollection.Id);

        if (model) {
            this.dialogRef.close({
                data: model,
                filter: {
                    'status-collection': this.viewFilter.filterStatus,
                    'text-collection': this.searchInput.nativeElement.value
                }
            })
        }
    }

    loadCollections(): void {
        const queryParams = new QueryParamsModel(
            this.filterConfiguration(),
            this.sort.direction,
            this.sort.active,
            this.paginator.pageIndex,
            this.paginator.pageSize
        );

        this.viewData.dataSource.load(this.viewData.collectionsStored, queryParams);
    }

    private filterConfiguration(): any {
        const filter: any = {};

        const searchText: string = this.searchInput.nativeElement.value;

        if (this.viewFilter.filterStatus && this.viewFilter.filterStatus.length > 0) {
            filter.Status = this.viewFilter.filterStatus;
        }

        filter.Title = searchText;

        return filter;
    }

    private init(): void {
        this.bindDataSource();
        this.bindEvents();

        this.refresh();
    }

    private bindDataSource(): void {
        const queryParams = new QueryParamsModel(this.filterConfiguration());

        this.viewData.dataSource.init(this.viewData.collections$, queryParams);
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0))
        );

        this._obsers.push(
            this.viewData.dataSource.entitySubject.subscribe(res => {
                this.viewData.collectionsResult = res;
            })
        );

        this._obsers.push(
            this.viewData.collections$.subscribe(res => {
                this.viewData.collectionsStored = res;
            })
        );
    }

    private bindEvents(): void {
        this._obsers.push(
            merge(this.sort.sortChange, this.paginator.page)
                .pipe(
                    tap(() => {
                        this.loadCollections();
                    })
                )
                .subscribe()
        );

        this._obsers.push(
            fromEvent(this.searchInput.nativeElement, 'keyup')
                .pipe(
                    debounceTime(150),
                    distinctUntilChanged(),
                    tap(() => {
                        this.loadCollections();
                    })
                )
                .subscribe()
        );
    }
}
