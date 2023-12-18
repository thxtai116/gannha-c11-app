import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { BehaviorSubject, merge, fromEvent } from 'rxjs';
import { PromotionsDetailState } from '../../states';
import { SubheaderService, LanguagePipe, PromotionCodeCampaignModel, PromotionCustomerModel, PromotionCodeCampaignService, PromotionCustomerDataSource, PromotionCustomerViewModel, QueryParamsModel, Status, ConfirmService, SystemAlertService } from '../../../../../../core/core.module';
import { MenuService } from '../../services';
import { MatPaginator, MatSort } from '@angular/material';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'm-promotions-customer',
    templateUrl: './promotions-customer.page.html',
    styleUrls: ['./promotions-customer.page.scss']
})
export class PromotionsCustomerPage implements OnInit {
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild('searchInput', { static: true }) searchInput: ElementRef;

    private _obsers: any[] = [];

    private _readyConditions: Map<string, boolean> = new Map([
        ["Promotion", false],
    ]);

    lang: string = "vi";
    status: any = Status;

    viewControl: any = {
        ready: false,
        loading$: new BehaviorSubject<boolean>(false)
    }

    viewFilter: any = {
        filterStatus: "",
    };

    viewData: any = {
        displayedColumns: ["Index", "Code", "PhoneNumber", "ExpiredAt", "Status", "Actions"],
        promotion: new PromotionCodeCampaignModel(),
        dataSource: new PromotionCustomerDataSource(),
        customers$: new BehaviorSubject<PromotionCustomerViewModel[]>([]),
        customersStored: new Array<PromotionCustomerViewModel>(),
    }

    constructor(
        private _promotionsDetailState: PromotionsDetailState,
        private _promotionCodeCampaignService: PromotionCodeCampaignService,
        private _subheaderService: SubheaderService,
        private _menuService: MenuService,
        private _confirmService: ConfirmService,
        private _systemAlertService: SystemAlertService,
        private _translate: TranslateService,
    ) { }

    ngOnInit() {
        this.viewControl.loading$.next(true);

        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    async apply(id: number) {
        const dialogRef = this._confirmService.show(this._translate.instant('COMMON.CONFIRMATION'), this._translate.instant('PROMOTION_CODE.APPLY_COMFIRM'));

        let sub = dialogRef.afterClosed().subscribe(res => {
            if (!res) {
                return;
            }

            this.viewControl.loading$.next(true);

            Promise.all([
                this._promotionCodeCampaignService.apply(this.viewData.promotion.Id, id)
            ]).then(value => {
                if (value[0]) {
                    this._systemAlertService.success(this._translate.instant('PROMOTION_CODE.APPLY_SUCCESS'));
                    this.refresh();
                } else {
                    this.viewControl.loading$.next(false);
                }
            }).catch(() => {
                this.viewControl.loading$.next(false);
            }).finally(() => sub.unsubscribe());
        });
    }

    async refresh() {
        this.viewControl.loading$.next(true);

        let customers = await this._promotionCodeCampaignService.getCustomers(this.viewData.promotion.Id);

        let vms = this.convertModelToViewModel(customers);

        this.viewData.customers$.next(vms);

        this.viewControl.loading$.next(false);
    }

    onStatusChange(): void {
        this.loadCustomers();
    }

    private init(): void {
        if (Array.from(this._readyConditions.values()).filter(x => x === false).length === 0) {
            if (this.viewControl.ready) return;

            this.viewControl.ready = true;

            this._promotionsDetailState.menu$.next(this._menuService.getPromotionsDetailMenu());

            Promise.all([
                this._promotionCodeCampaignService.getCustomers(this.viewData.promotion.Id),
            ]).then(value => {
                let vms = this.convertModelToViewModel(value[0]);
                this.viewData.customers$.next(vms);
            });

            this.bindBreadcrumbs();
            this.bindDataSource();
            this.bindEvents();

            this.viewControl.loading$.next(false);
        }
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "PROMOTION_CODE.LIST", page: '/promotions' },
            { title: new LanguagePipe().transform(this.viewData.promotion.Name), page: `/promotions/${this.viewData.promotion.Id}` },
            { title: "PROMOTION_CODE.CUSTOMERS", page: `/promotions/${this.viewData.promotion.Id}/customers` }
        ]);
    }

    private bindDataSource(): void {
        const queryParams = new QueryParamsModel(this.filterConfiguration());
        this.viewData.dataSource.init(this.viewData.customers$, queryParams);
    }

    private filterConfiguration(): any {
        const filter: any = {};

        const searchText: string = this.searchInput.nativeElement.value;

        if (this.viewFilter.filterStatus && this.viewFilter.filterStatus.length > 0) {
            filter.Status = this.viewFilter.filterStatus;
        }

        filter.filterGroup = {
            Code: searchText.toString(),
            PhoneNumber: searchText.toString(),
        }

        return filter;
    }

    private convertModelToViewModel(models: PromotionCustomerModel[], ): PromotionCustomerViewModel[] {
        let viewModels: PromotionCustomerViewModel[] = [];

        for (let model of models) {
            let vm: PromotionCustomerViewModel = new PromotionCustomerViewModel();

            vm.Id = model.Id;
            vm.Code = model.Code;
            vm.Status = model.Status;
            vm.PhoneNumber = model.PhoneNumber || "";
            vm.ExpiredAt = model.ExpiredAt;
            viewModels.push(vm);
        }

        return viewModels;
    }

    private loadCustomers(): void {
        const queryParams = new QueryParamsModel(
            this.filterConfiguration(),
            this.sort.direction,
            this.sort.active,
            this.paginator.pageIndex,
            this.paginator.pageSize
        );

        this.viewData.dataSource.load(this.viewData.customersStored, queryParams);
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this._promotionsDetailState.promotion$.subscribe(value => {
                if (value) {
                    this.viewData.promotion = value;
                    this._readyConditions.set("Promotion", true);
                    this.init();
                }
            })
        );
        this._obsers.push(
            this.viewData.customers$.subscribe(res => {
                this.viewData.customersStored = res;
            })
        );
    }

    private bindEvents(): void {
        this._obsers.push(
            merge(this.paginator.page)
                .pipe(
                    tap(() => {
                        this.loadCustomers();
                    })
                )
                .subscribe()
        );

        this._obsers.push(
            merge(this.sort.sortChange)
                .pipe(
                    tap(() => {
                        this.loadCustomers();
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
                        this.loadCustomers();
                    })
                )
                .subscribe()
        );
    }
}
