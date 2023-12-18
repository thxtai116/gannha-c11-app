import { Component, OnInit, ChangeDetectionStrategy, ElementRef, ViewChild, Inject } from '@angular/core';
import { MatPaginator, MatSort, MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { BehaviorSubject, merge, fromEvent } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';

import {
    CollectionsDataSource,

    CollectionOverviewViewModel,

    CollectionService,

    CollectionTransformer,

    QueryParamsModel,

    CollectionModel,
} from '../../../../../../../core/core.module';
import { tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SelectionPreviewComponent } from '../../../../components/selection-preview/selection-preview.component';


@Component({
    selector: 'm-collection-collections-selector',
    templateUrl: './collections-selector.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollectionsSelectorComponent implements OnInit {

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild('searchInput', { read: ElementRef, static: true }) searchInput: ElementRef;

    private _obsers: any[] = [];

    lang: string = "vi";

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false)
    };

    viewData: any = {
        displayedColumns: ["Select", "Index", "Title", "StartDate", "EndDate", "Status"],
        dataSource: new CollectionsDataSource(),
        selection: new SelectionModel<CollectionOverviewViewModel>(true, []),
        initialCollections: new Array<string>(),
        originCollections: new Array<CollectionModel>(),
        collections$: new BehaviorSubject<CollectionOverviewViewModel[]>([]),
        collectionsResult: new Array<CollectionOverviewViewModel>(),
        collectionsStored: new Array<CollectionOverviewViewModel>()
    };

    viewFilter: any = {
        filterStatus: ""
    };

    constructor(
        public dialogRef: MatDialogRef<CollectionsSelectorComponent>,
        private _collectionService: CollectionService,
        private _collectionTransformer: CollectionTransformer,
        public dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: any) {
    }

    ngOnInit() {
        this.viewControl.loading$ = this.viewData.dataSource.loadingSubject;
        this.viewControl.loading$.next(true);

        this.parseInjectionData(this.data);
        this.init();

        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    private parseInjectionData(data: any) {
        this.viewData.initialCollections = data.selected || [];

        this.viewFilter.filterStatus = data.filter['status'] || "";
        this.searchInput.nativeElement.value = data.filter['text'] || "";
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

    isAllSelected(): boolean {
        const numSelected = this.viewData.selection.selected.length;
        const numRows = this.viewData.dataSource.paginatorTotalSubject.value;

        return numSelected === numRows;
    }

    masterToggle(): void {
        if (this.isAllSelected()) {
            this.viewData.selection.clear();
        } else {
            this.viewData.dataSource.entityStoredSubject.value.forEach(row => this.viewData.selection.select(row));
        }
    }

    onPreviewSelection(): void {
        let data = {
            selectedItems: this.viewData.selection.selected.map(x => x.Name)
        }

        const dialogRef = this.dialog.open(SelectionPreviewComponent, { data: data, panelClass: ['m-mat-dialog-container__wrapper', 'mat-dialog-container--confirmation'], disableClose: true });

        let sub = dialogRef.afterClosed().subscribe(value => {
            sub.unsubscribe();
        })
    }

    unselectAll(): void {
        this.viewData.selection.clear();
    }

    onSelectStatus(): void {
        this.loadCollections();
    }

    onCancelClick(): void {
        this.dialogRef.close({
            filter: {
                'status': this.viewFilter.filterStatus,
                'text': this.searchInput.nativeElement.value
            }
        });
    }

    onSubmit(): void {
        if (this.viewData.selection.selected.length === 0)
            return;

        this.dialogRef.close({
            data: this.viewData.originCollections.filter(x => this.viewData.selection.selected.find(y => x.Id === y.Id)),
            filter: {
                'status': this.viewFilter.filterStatus,
                'text': this.searchInput.nativeElement.value
            }
        });
    }

    private init(): void {
        Promise.all([
            this._collectionService.getAll()
        ]).then(value => {
            this.viewData.originCollections = value[0];

            let vms = this.viewData.originCollections.filter(x => this.viewData.initialCollections.indexOf(x.Id) === -1).map(value => {
                return this._collectionTransformer.toCollectionOverview(value);
            });

            this.viewData.collections$.next(vms);

            this.loadCollections();

            this.viewControl.loading$.next(false);
        }).catch(() => {
            this.viewControl.loading$.next(false);
        });

        this.bindDataSource();
        this.bindEvents();
    }

    private bindDataSource(): void {
        const queryParams = new QueryParamsModel(this.filterConfiguration());

        this.viewData.dataSource.init(this.viewData.collections$, queryParams);
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