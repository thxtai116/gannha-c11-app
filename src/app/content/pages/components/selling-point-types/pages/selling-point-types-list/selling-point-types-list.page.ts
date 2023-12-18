import { ChangeDetectionStrategy, Component, OnInit, ViewChild, Renderer, ElementRef } from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';
import { BehaviorSubject, merge, fromEvent } from 'rxjs';
import { tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { environment } from '../../../../../../../environments/environment';

import {
    SellingPointTypeModel,
    SellingPointTypeViewModel,
    QueryParamsModel,

    SellingPointTypeTransformer,

    SubheaderService,
    SellingPointTypeService,

    SellingPointTypesDataSource,
} from '../../../../../../core/core.module';

@Component({
    selector: 'm-selling-point-types-list',
    templateUrl: './selling-point-types-list.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SellingPointTypesListPage implements OnInit {

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild('searchInput', { static: true }) searchInput: ElementRef;

    storageEndpoint: string = environment.storageEndpoint;

    private _obsers: any[] = [];

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false),
        ready: false,
    }

    viewData: any = {
        displayedColumns: ["Index", "Name", "Color", "Icon", "Actions"],
        dataSource: new SellingPointTypesDataSource(),

        spTypes$: new BehaviorSubject<SellingPointTypeViewModel[]>([]),
        spTypesResult: new Array<SellingPointTypeModel>(),
        spTypesStored: new Array<SellingPointTypeModel>()
    }

    constructor(
        private _spTypesService: SellingPointTypeService,
        private _subheaderService: SubheaderService,
        private _spTypeTransFormer: SellingPointTypeTransformer,
    ) {

    }

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

    loadSpTypes(): void {
        const queryParams = new QueryParamsModel(
            this.filterConfiguration(),
            this.sort.direction,
            this.sort.active,
            this.paginator.pageIndex,
            this.paginator.pageSize
        );

        this.viewData.dataSource.load(this.viewData.spTypesStored, queryParams);
    }

    async refresh() {
        this.viewControl.loading$.next(true);

        let utils = await this._spTypesService.getAll(true);

        let vms = utils.map(value => {
            return this._spTypeTransFormer.toSellingPointTypeview(value);
        });

        this.viewControl.loading$.next(false);

        this.viewData.spTypes$.next(vms);
    }

    private init() {
        if (this.viewControl.ready) return;
        this.viewControl.ready = true;

        Promise.all([
            this._spTypesService.getAll()
        ]).then(value => {
            let sps = value[0];

            let vms = sps.map(value => {
                return this._spTypeTransFormer.toSellingPointTypeview(value);
            });

            this.viewData.spTypes$.next(vms);
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

        return filter;
    }

    private bindDataSource(): void {
        const queryParams = new QueryParamsModel(this.filterConfiguration());

        this.viewData.dataSource.init(this.viewData.spTypes$, queryParams);
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "SELLING_POINT_TYPES.LIST", page: '/selling-point-types' }
        ]);
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0))
        );

        this._obsers.push(
            this.viewData.dataSource.entitySubject.subscribe(res => {
                this.viewData.spTypesResult = res;
            })
        );

        this._obsers.push(
            this.viewData.spTypes$.subscribe(res => {
                this.viewData.spTypesStored = res;
            })
        );
    }

    private bindEvents(): void {
        this._obsers.push(
            merge(this.sort.sortChange, this.paginator.page)
                .pipe(
                    tap(() => {
                        this.loadSpTypes();
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
                        this.loadSpTypes();
                    })
                )
                .subscribe()
        );
    }
}
