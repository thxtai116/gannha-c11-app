import { ChangeDetectionStrategy, Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { MatPaginator, MatSort, MatBottomSheet } from '@angular/material';

import { BehaviorSubject, merge, fromEvent } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import {
    BrandModel,
    QueryParamsModel,
    SellingPointOverviewViewModel,

    SellingPointsDataSource,

    BrandService,
    SubheaderService,
    FilterStorageService,

    SellingPointTransformer,
    StorageUtility,
    LocalStorageKey,
    SellingPointModel,
    ConfirmService,
} from '../../../../../../core/core.module';

import { SellingPointsState } from '../../states';
import { ActionsPreviewSheetComponent } from '../../../../shared/modules/selling-point-service/selling-point-service.module';

@Component({
    selector: 'm-selling-points-list',
    templateUrl: './selling-points-list.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SellingPointsListPage implements OnInit, OnDestroy {

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild('searchInput', { static: true }) searchInput: ElementRef;

    private _obsers: any[] = [];
    private _filter: any = {};

    private _readyConditions: Map<string, boolean> = new Map([
        ["Brand", false]
    ]);

    viewFilter: any = {
        filterStatus: "2"
    };

    viewControl: any = {
        ready: false,
        draftMode: false,
        loading$: new BehaviorSubject<boolean>(false)
    }

    viewData: any = {
        brand: new BrandModel(),
        displayedColumns: ["Index", "Title", "StartDate", "EndDate", "Status", "Actions"],
        dataSource: new SellingPointsDataSource(),
        sellingPoints$: new BehaviorSubject<SellingPointOverviewViewModel[]>([]),
        sellingPointsResult: new Array<SellingPointOverviewViewModel>(),
        sellingPointsStored: new Array<SellingPointOverviewViewModel>(),
        sellingPointsStoredDraft: new Array<SellingPointOverviewViewModel>(),
    }

    constructor(
        private _brandService: BrandService,
        private _subheaderService: SubheaderService,
        private _translate: TranslateService,
        private _filterStorageService: FilterStorageService,
        private _sellingPointTransformer: SellingPointTransformer,
        private _sellingPointsState: SellingPointsState,
        private _matBottomSheet: MatBottomSheet,
        private _storageUtil: StorageUtility,
        private _confirmService: ConfirmService,
    ) {
    }

    ngOnInit(): void {
        this.viewControl.loading$ = this.viewData.dataSource.loadingSubject;
        this.viewControl.loading$.next(true);

        this.initFilter();

        let brand = this._sellingPointsState.brand$.getValue();

        if (brand) {
            this.viewData.brand = brand;

            this._readyConditions.set("Brand", true);

            if (this.viewControl.ready) {
                this.refresh();
            } else {
                this.init();
            }
        }

        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    onStatusChange(): void {
        this.saveFilter('status', this.viewFilter.filterStatus);

        this.loadSellingPoints();
    }

    onActionsClick(event): void {
        let data: any = event;

        this._matBottomSheet.open(ActionsPreviewSheetComponent, { data });
    }

    refresh(): void {
        this.viewControl.loading$.next(true);

        Promise.all([
            this._brandService.getSellingPoints(this.viewData.brand.Id)
        ]).then(value => {
            let units = value[0];
            let vms = units.map(value => {
                return this._sellingPointTransformer.toSellingPointOverview(value);
            });

            this.viewData.sellingPoints$.next(vms);

            this.loadSellingPoints();
        }).finally(() => {
            this.viewControl.loading$.next(false);
        });
    }

    refreshDraft() {
        this.viewControl.loading$.next(true);

        let drafts = JSON.parse(this._storageUtil.get(LocalStorageKey.draftSellingPoints)) || [];

        this.viewData.sellingPointsStoredDraft = drafts.filter(x => x.BrandId == this.viewData.brand.Id).map(value => {
            return this._sellingPointTransformer.toSellingPointOverview(value);
        });

        this.loadSellingPointsDraft();

        this.viewControl.loading$.next(false);
    }

    changeDraftMode(): void {
        this.viewControl.draftMode = true;
        this.loadSellingPointsDraft();
    }

    changeNormalMode() {
        this.viewControl.draftMode = false;
        this.loadSellingPoints();
    }

    deleteDraft(id: string) {
        const dialogRef = this._confirmService.show(this._translate.instant('COMMON.CONFIRMATION'), this._translate.instant('SELLING_POINTS.DELETE_DRAFT_COMFIRM'));

        let sub = dialogRef.afterClosed().subscribe(res => {
            if (!res) {
                return;
            }

            let currentList: SellingPointModel[] = JSON.parse(this._storageUtil.get(LocalStorageKey.draftSellingPoints));

            let index = currentList.findIndex(x => x.Id == id);
            currentList.splice(index, 1);
            this._storageUtil.set(LocalStorageKey.draftSellingPoints, JSON.stringify(currentList));

            let drafts = JSON.parse(this._storageUtil.get(LocalStorageKey.draftSellingPoints)) || [];

            this.viewData.sellingPointsStoredDraft = drafts.filter(x => x.BrandId == this.viewData.brand.Id).map(value => {
                return this._sellingPointTransformer.toSellingPointOverview(value);
            });

            this.loadSellingPointsDraft();

            sub.unsubscribe();
        });
    }

    private init(): void {
        if (Array.from(this._readyConditions.values()).filter(x => x === false).length === 0) {
            if (this.viewControl.ready) return;

            this.viewControl.ready = true;

            let drafts = JSON.parse(this._storageUtil.get(LocalStorageKey.draftSellingPoints)) || [];

            this.viewData.sellingPointsStoredDraft = drafts.filter(x => x.BrandId == this.viewData.brand.Id).map(value => {
                return this._sellingPointTransformer.toSellingPointOverview(value);
            });

            this.bindBreadcrumbs();

            Promise.all([
                this._brandService.getSellingPoints(this.viewData.brand.Id)
            ]).then(value => {
                let sps = value[0];
                let vms = sps.map(value => {
                    return this._sellingPointTransformer.toSellingPointOverview(value);
                });

                this.viewData.sellingPoints$.next(vms);

                this.loadSellingPoints();

            }).finally(() => {
                this.viewControl.loading$.next(false);
            });

            this.bindDataSource();
            this.bindEvents();
        }
    }

    private bindDataSource(): void {
        const queryParams = new QueryParamsModel(this.filterConfiguration());

        this.viewData.dataSource.init(this.viewData.sellingPoints$, queryParams);
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

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "SELLING_POINTS.LIST", page: `/selling-points` }
        ]);
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0))
        );

        this._obsers.push(
            this._sellingPointsState.brand$.subscribe(value => {
                if (value) {
                    this.viewData.brand = value;

                    this._readyConditions.set("Brand", true);

                    if (this.viewControl.ready) {
                        this.refresh();
                    } else {
                        this.init();
                    }
                }
            })
        );

        this._obsers.push(
            this.viewData.dataSource.entitySubject.subscribe(res => {
                this.viewData.sellingPointsResult = res;
            })
        );

        this._obsers.push(
            this.viewData.sellingPoints$.subscribe(res => {
                this.viewData.sellingPointsStored = res;
            })
        );

        this._obsers.push(
            this._translate.onLangChange.subscribe(() => {
                this.bindBreadcrumbs();
            })
        );
    }

    private bindEvents(): void {
        this._obsers.push(
            merge(this.sort.sortChange, this.paginator.page)
                .pipe(
                    tap(() => {
                        if (!this.viewControl.draftMode) {
                            this.loadSellingPoints();
                        } else {
                            this.loadSellingPointsDraft();
                        }
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
                        if (!this.viewControl.draftMode) {
                            this.saveFilter('text', this.searchInput.nativeElement.value);
                            this.loadSellingPoints();
                        } else {
                            this.loadSellingPointsDraft(this.searchInput.nativeElement.value);
                        }
                    })
                )
                .subscribe()
        );
    }

    private saveFilter(key: string, value: any) {
        this._filter[key] = value;

        this._filterStorageService.set(SellingPointsListPage.name, this._filter);
    }

    private initFilter() {
        this._filter = this._filterStorageService.get(SellingPointsListPage.name);

        if (this._filter) {
            this.viewFilter.filterStatus = this._filter['status'] || "";
            this.searchInput.nativeElement.value = this._filter['text'] || "";
        } else {
            this._filter = {};
        }
    }

    private loadSellingPoints(): void {
        const queryParams = new QueryParamsModel(
            this.filterConfiguration(),
            this.sort.direction,
            this.sort.active,
            this.paginator.pageIndex,
            this.paginator.pageSize
        );

        this.viewData.dataSource.load(this.viewData.sellingPointsStored, queryParams);
    }


    private loadSellingPointsDraft(searchText: string = ""): void {
        const queryParams = new QueryParamsModel(
            { Status: "", Title: searchText },
            this.sort.direction,
            this.sort.active,
            this.paginator.pageIndex,
            this.paginator.pageSize
        );

        this.viewData.dataSource.load(this.viewData.sellingPointsStoredDraft, queryParams);
    }
}
