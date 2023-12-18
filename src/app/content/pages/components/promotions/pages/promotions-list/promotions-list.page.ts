import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';
import { BehaviorSubject, merge, fromEvent } from 'rxjs';
import { PromotionCodeCampaignService, SubheaderService, PromotionCampaignViewModel, PromotionCampaignDataSource, QueryParamsModel, PromotionCodeCampaignModel, LanguagePipe } from '../../../../../../core/core.module';
import { tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
    selector: 'm-promotions-list',
    templateUrl: './promotions-list.page.html',
    styleUrls: ['./promotions-list.page.scss']
})
export class PromotionsListPage implements OnInit {
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild('searchInput', { static: true }) searchInput: ElementRef;

    private _obsers: any[] = [];
    private _filter: any = {};

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false),
        ready: false,
    };

    viewFilter: any = {
        filterStatus: "",
        filterCategory: ""
    };

    viewData: any = {
        displayedColumns: ["Index", "Name", "CreatedAt", "Status", "Actions"],
        dataSource: new PromotionCampaignDataSource(),
        promotions$: new BehaviorSubject<PromotionCampaignViewModel[]>([]),
        promotionsStored: new Array<PromotionCampaignViewModel>(),
    }

    constructor(
        private _promotionCodeCampaignService: PromotionCodeCampaignService,
        private _subheaderService: SubheaderService,
    ) { }

    ngOnInit() {
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

    async refresh() {
        this.viewControl.loading$.next(true);

        let promotions = await this._promotionCodeCampaignService.getAll();

        let vms = this.convertModelToViewModel(promotions);

        this.viewData.promotions$.next(vms);

        this.viewControl.loading$.next(false);
    }

    private loadPromotions(): void {
        const queryParams = new QueryParamsModel(
            this.filterConfiguration(),
            this.sort.direction,
            this.sort.active,
            this.paginator.pageIndex,
            this.paginator.pageSize
        );

        this.viewData.dataSource.load(this.viewData.promotionsStored, queryParams);
    }

    private init(): void {
        if (this.viewControl.ready) return;
        this.viewControl.ready = true;

        Promise.all([
            this._promotionCodeCampaignService.getAll()
        ]).then(value => {
            let vms = this.convertModelToViewModel(value[0]);
            this.viewData.promotions$.next(vms);
        }).catch(() => {
            this.viewControl.loading$.next(false);
        }).finally(() => {
            this.viewControl.loading$.next(false);
        })

        this.bindBreadcrumbs();
        this.bindDataSource();
        this.bindEvents();
    }

    private filterConfiguration(): any {
        const filter: any = {};

        const searchText: string = this.searchInput.nativeElement.value;

        if (this.viewFilter.filterStatus && this.viewFilter.filterStatus.length > 0) {
            filter.Status = this.viewFilter.filterStatus;
        }

        filter.Name = searchText;

        return filter;
    }

    private convertModelToViewModel(models: PromotionCodeCampaignModel[], ): PromotionCampaignViewModel[] {
        let viewModels: PromotionCampaignViewModel[] = [];

        for (let model of models) {
            let vm: PromotionCampaignViewModel = new PromotionCampaignViewModel();

            vm.Id = model.Id;
            vm.Name = new LanguagePipe().transform(model.Name);
            vm.Status = model.Status;
            vm.CreatedAt = model.CreatedAt;
            viewModels.push(vm);
        }

        return viewModels;
    }

    private bindDataSource(): void {
        const queryParams = new QueryParamsModel(this.filterConfiguration());

        this.viewData.dataSource.init(this.viewData.promotions$, queryParams);
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "PROMOTION_CODE.LIST", page: '/promotions' }
        ]);
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0))
        );

        this._obsers.push(
            this.viewData.promotions$.subscribe(res => {
                this.viewData.promotionsStored = res;
            })
        );
    }

    private bindEvents(): void {
        this._obsers.push(
            merge(this.paginator.page)
                .pipe(
                    tap(() => {
                        this.loadPromotions();
                    })
                )
                .subscribe()
        );

        this._obsers.push(
            merge(this.sort.sortChange)
                .pipe(
                    tap(() => {
                        this.loadPromotions();
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
                        this.loadPromotions();
                    })
                )
                .subscribe()
        );
    }
}
