import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';

import { BehaviorSubject, merge, fromEvent } from 'rxjs';

import {
    PlacesDataSource,

    PlaceOverviewViewModel,
    QueryParamsModel,

    PlaceService,
    SubheaderService,

    PlaceTransformer,
} from '../../../../../../core/core.module';
import { tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
    selector: 'm-places-list',
    templateUrl: './places-list.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlacesListPage implements OnInit {

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild('searchInput', { static: true }) searchInput: ElementRef;

    private _obsers: any[] = [];

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false)
    }

    viewData: any = {
        displayedColumns: ["Index", "Name", "Address", "Actions"],
        dataSource: new PlacesDataSource(),

        places$: new BehaviorSubject<PlaceOverviewViewModel[]>([]),
        placesResult: new Array<PlaceOverviewViewModel>(),
        placesStored: new Array<PlaceOverviewViewModel>()
    }

    constructor(
        private _placeService: PlaceService,
        private _subheaderService: SubheaderService,
        private _placeTransFormer: PlaceTransformer,
    ) { }

    ngOnInit(): void {
        this.viewControl.loading$ = this.viewData.dataSource.loadingSubject;
        this.viewControl.loading$.next(true);

        this.init();
        this.bindSubscribes();
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

    async refresh() {
        this.viewControl.loading$.next(true);

        let utils = await this._placeService.getAll(true);

        let vms = utils.map(value => {
            return this._placeTransFormer.toPlaceOverview(value);
        });

        this.viewControl.loading$.next(false);

        this.viewData.places$.next(vms);
    }

    private init() {
        if (this.viewControl.ready) return;
        this.viewControl.ready = true;

        Promise.all([
            this._placeService.getAll()
        ]).then(value => {
            let vms = value[0].map(value => {
                return this._placeTransFormer.toPlaceOverview(value);
            });

            this.viewData.places$.next(vms);
        }).catch(() => {
            this.viewControl.loading$.next(false);
        })

        this.bindBreadcrumbs();
        this.bindDataSource();
        this.bindEvents();
    }

    private filterConfiguration(): any {
        const filter: any = {};

        const searchText: string = this.searchInput.nativeElement.value;

        filter.Name = searchText;
        filter.Address = searchText;

        return filter;
    }

    private bindDataSource(): void {
        const queryParams = new QueryParamsModel(this.filterConfiguration());

        this.viewData.dataSource.init(this.viewData.places$, queryParams);
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "PLACES.LIST", page: '/places' }
        ]);
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
