import { Component, OnInit, ChangeDetectionStrategy, Inject, ElementRef, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatPaginator, MatSort } from '@angular/material';
import { BehaviorSubject, merge, fromEvent } from 'rxjs';
import { tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import {
    PlacesDataSource,

    PlaceOverviewViewModel,
    QueryParamsModel,

    PlaceService,

    PlaceTransformer,
} from '../../../../../core/core.module';

@Component({
    selector: 'm-places-selector',
    templateUrl: './places-selector.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlacesSelectorComponent implements OnInit {
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild('searchInput', { static: true }) searchInput: ElementRef;

    private _obsers: any[] = [];

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false)
    }

    viewData: any = {
        displayedColumns: ["Select", "Name", "Address"],
        dataSource: new PlacesDataSource(),
        place: new PlaceOverviewViewModel(),
        places$: new BehaviorSubject<PlaceOverviewViewModel[]>([]),
        placesResult: new Array<PlaceOverviewViewModel>(),
        placesStored: new Array<PlaceOverviewViewModel>()
    }

    constructor(
        private _placeService: PlaceService,
        private _placeTransformer: PlaceTransformer,
        public dialogRef: MatDialogRef<PlacesSelectorComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
    }

    ngOnInit(): void {
        this.viewControl.loading$ = this.viewData.dataSource.loadingSubject;
        this.viewControl.loading$.next(true);

        this.parseInjectionData(this.data);

        this.init(this.data.selectedBusinessCenterId);

        this.bindSubscribes();
    }

    private parseInjectionData(data: any) {
        this.searchInput.nativeElement.value = data.filter['text'] || "";
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    loadPlaces(): void {
        const queryParams = new QueryParamsModel(
            this.filterConfiguration(),
            this.sort.direction,
            this.sort.active,
            this.paginator.pageIndex,
            this.paginator.pageSize
        );

        this.viewData.dataSource.load(this.viewData.placesStored, queryParams);
    }

    onSubmit(): void {
        this.dialogRef.close({
            data: this.viewData.place,
            filter: {
                'text': this.searchInput.nativeElement.value
            }
        });
    }

    onCancelClick(): void {
        this.dialogRef.close({
            filter: {
                'text': this.searchInput.nativeElement.value
            }
        });
    }

    private init(id: string): void {
        this.bindDataSource();
        this.bindEvents();

        Promise.all([
            this._placeService.getAll()
        ]).then(value => {
            let vms = value[0].map(x => this._placeTransformer.toPlaceOverview(x));

            if (id.length > 0) {
                this.viewData.place = vms.find(x => x.Id === id);
            } else {
                this.viewData.place = vms[0];
            }

            this.viewData.places$.next(vms);

            this.viewData.selection.selected = vms;

            this.viewControl.loading$.next(false);
        }).catch(() => {
            this.viewControl.loading$.next(false);
        });
    }

    private filterConfiguration(): any {
        const filter: any = {};

        const searchText: string = this.searchInput.nativeElement.value;

        filter.filterGroup = {
            Name: searchText,
            Address: searchText,
        }

        return filter;
    }

    private bindDataSource(): void {
        const queryParams = new QueryParamsModel(this.filterConfiguration());

        this.viewData.dataSource.init(this.viewData.places$, queryParams);
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0))
        );

        this._obsers.push(
            this.viewData.dataSource.entitySubject.subscribe(res => {
                this.viewData.placesResult = res;
            })
        );

        this._obsers.push(
            this.viewData.places$.subscribe(res => {
                this.viewData.placesStored = res;
            })
        );
    }

    private bindEvents(): void {
        this._obsers.push(
            merge(this.sort.sortChange, this.paginator.page)
                .pipe(
                    tap(() => {
                        this.loadPlaces();
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
                        this.loadPlaces();
                    })
                )
                .subscribe()
        );
    }
}
