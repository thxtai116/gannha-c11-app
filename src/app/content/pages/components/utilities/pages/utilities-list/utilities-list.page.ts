import { OnInit, OnDestroy, ChangeDetectionStrategy, Component, ViewChild, Renderer, ElementRef } from "@angular/core";
import { MatSort, MatPaginator } from "@angular/material";
import { BehaviorSubject, merge, fromEvent } from "rxjs";
import { tap, debounceTime, distinctUntilChanged } from "rxjs/operators";

import {
    UtilitiesDataSource,

    QueryParamsModel,
    UtilityViewModel,
    UtilityTransformer,

    AppInsightsUtility,
    LanguageUtility,

    SystemAlertService,
    SubheaderService,
    ConfirmService,
    UtilityService,
} from "../../../../../../core/core.module";

import { environment } from "../../../../../../../environments/environment";

@Component({
    selector: 'app-utilities-list',
    templateUrl: './utilities-list.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class UtilitiesListPage implements OnInit, OnDestroy {

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
        displayedColumns: ["Index", "Name", "Icon", "Actions"],
        dataSource: new UtilitiesDataSource(),

        utilities$: new BehaviorSubject<UtilityViewModel[]>([]),
        utilitiesResult: new Array<UtilityViewModel>(),
        utilitiesStored: new Array<UtilityViewModel>()
    }

    constructor(
        private _renderer: Renderer,
        private _utilService: UtilityService,
        private _systemAlertService: SystemAlertService,
        private _subheaderService: SubheaderService,
        private _confirmService: ConfirmService,
        private _appInsightUtil: AppInsightsUtility,
        private _languageUtil: LanguageUtility,
        private _utilTransformer: UtilityTransformer,
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

    loadUtils(): void {
        const queryParams = new QueryParamsModel(
            this.filterConfiguration(),
            this.sort.direction,
            this.sort.active,
            this.paginator.pageIndex,
            this.paginator.pageSize
        );

        this.viewData.dataSource.load(this.viewData.utilitiesStored, queryParams);
    }

    async refresh() {
        this.viewControl.loading$.next(true);

        let utils = await this._utilService.getAll(true);

        let vms = utils.map(value => {
            return this._utilTransformer.toUtilViewModel(value);
        });

        this.viewControl.loading$.next(false);

        this.viewData.utilities$.next(vms);
    }

    private init() {
        if (this.viewControl.ready) return;
        this.viewControl.ready = true;

        Promise.all([
            this._utilService.getAll()
        ]).then(value => {
            let utils = value[0];

            let vms = utils.map(value => {
                return this._utilTransformer.toUtilViewModel(value);
            });

            this.viewData.utilities$.next(vms);
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

        this.viewData.dataSource.init(this.viewData.utilities$, queryParams);
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "UTILITIES.LIST", page: '/utilities' }
        ]);
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0))
        );


        this._obsers.push(
            this.viewData.dataSource.entitySubject.subscribe(res => {
                this.viewData.utilitiesResult = res;
            })
        );

        this._obsers.push(
            this.viewData.utilities$.subscribe(res => {
                this.viewData.utilitiesStored = res;
            })
        );
    }

    private bindEvents(): void {
        this._obsers.push(
            merge(this.sort.sortChange, this.paginator.page)
                .pipe(
                    tap(() => {
                        this.loadUtils();
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
                        this.loadUtils();
                    })
                )
                .subscribe()
        );
    }
}