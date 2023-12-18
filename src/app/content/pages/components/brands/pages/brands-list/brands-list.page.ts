import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ElementRef,
    ViewChild,
    OnDestroy,
    ChangeDetectorRef
} from '@angular/core';

import { MatSort, MatPaginator, MatDialog } from '@angular/material';

import { fromEvent, merge, BehaviorSubject } from 'rxjs';

import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';

import {
    BrandsDataSource,

    CategoryModel,
    BrandModel,
    QueryParamsModel,
    BrandViewModel,
    UserInfoModel,

    SubheaderService,
    BrandService,
    FilterStorageService,

    LanguagePipe,

    GlobalState,

    RoleType
} from "../../../../../../core/core.module";

import { BrandsState } from "../../states/index";
import { BrandManagersComponent } from '../../components/brand-managers/brand-managers.component';

@Component({
    selector: 'm-brands-list',
    templateUrl: './brands-list.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrandsListPage implements OnInit, OnDestroy {

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild('searchInput', { static: true }) searchInput: ElementRef;

    private _obsers: any[] = [];
    private _filter: any = {};

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false),
        ready: false,
        readyConditions: new Map([
            ["Categories", false],
            ["User", false]
        ])
    };

    viewFilter: any = {
        filterStatus: "",
        filterCategory: ""
    };

    viewData: any = {
        displayedColumns: ["Index", "Name", "CategoryNames", "Supervisors", "Status", "Actions"],
        dataSource: new BrandsDataSource(),
        categories: new Array<CategoryModel>(),
        filterCategories$: new BehaviorSubject<any[]>([]),
        brands$: new BehaviorSubject<BrandViewModel[]>([]),
        brandsStored: new Array<BrandViewModel>(),
        additionalInfo: new Array<any[]>(),
        userInfo: new UserInfoModel()
    }

    constructor(
        private _subheaderService: SubheaderService,
        private _brandService: BrandService,
        private _filterStorageService: FilterStorageService,
        private _brandsState: BrandsState,
        private _globalState: GlobalState,
        private _changeRef: ChangeDetectorRef,
        public dialog: MatDialog,
    ) {
    }

    ngOnInit(): void {
        this.viewControl.loading$ = this.viewData.dataSource.loadingSubject;
        this.viewControl.loading$.next(true);

        this.initFilter();

        this.viewData.categories = this._brandsState.subCategories$.getValue();

        if (this._brandsState.subCategories$.getValue()) {
            this.viewData.categories = this._brandsState.subCategories$.getValue();
            this.viewControl.readyConditions.set("Categories", true);

            this.init();
        }

        if (this._globalState.userInfoSub$.getValue()) {
            this.viewData.userInfo = this._globalState.userInfoSub$.getValue();
            this.viewControl.readyConditions.set("User", true);

            this.init();
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

        this.loadBrands();
    }

    onSupervisorClick(brandId: string) {
        const dialogRef = this.dialog.open(BrandManagersComponent, {
            data: brandId, width: '1000px', height: 'auto', disableClose: true
        });

        dialogRef.afterClosed().subscribe(res => {
            if (res && res.data == true)
                this.loadBrands();
        });
    }

    async refresh() {
        this.viewControl.loading$.next(true);

        let brands = await this._brandService.getAll(this.viewFilter.filterCategory);

        this.viewControl.loading$.next(false);

        this.viewData.brands$.next(this.convertModelToViewModel(brands, this.viewData.categories));
    }

    async onSelectCategory() {
        this.viewControl.loading$.next(true);

        let brands = await this._brandService.getAll(this.viewFilter.filterCategory);

        this.viewControl.loading$.next(false);

        this.viewData.brands$.next(this.convertModelToViewModel(brands, this.viewData.categories));

        this.saveFilter('category', this.viewFilter.filterCategory);
    }

    private loadBrands(): void {
        const queryParams = new QueryParamsModel(
            this.filterConfiguration(),
            this.sort.direction,
            this.sort.active,
            this.paginator.pageIndex,
            this.paginator.pageSize
        );

        this.viewData.dataSource.load(this.viewData.brandsStored, queryParams);
    }

    private init(): void {
        if (Array.from(this.viewControl.readyConditions.values()).filter(x => x === false).length === 0) {
            if (this.viewControl.ready) return;

            this.viewControl.ready = true;

            this.bindBreadcrumbs();
            this.bindDataSource();
            this.bindEvents();

            this.viewData.filterCategories$.next(this.initFilterCategories(this.viewData.categories));

            this.viewControl.loading$.next(false);

            if (!this._filter['category'] && this.viewData.userInfo.RoleNames.indexOf(RoleType.Admin) === -1 && this.viewData.userInfo.RoleNames.indexOf(RoleType.System) === -1) {
                this.viewFilter.filterCategory = "All";

                this.refresh();
            } else if (this._filter['category'])
                this.refresh();
        }
    }

    private initFilterCategories(categories: CategoryModel[]): any[] {
        let cats = [
            {
                id: "All",
                text: "Tất cả"
            }
        ];

        cats = cats.concat(categories.map(x => {
            return {
                id: x.Id,
                text: new LanguagePipe().transform(x.Name)
            }
        }));

        return cats;
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

    private convertModelToViewModel(models: BrandModel[], categories: CategoryModel[]): BrandViewModel[] {
        let viewModels: BrandViewModel[] = [];

        for (let model of models) {
            let vm: BrandViewModel = new BrandViewModel();

            vm.Id = model.Id;
            vm.Name = new LanguagePipe().transform(model.Name);
            vm.Status = model.Status;
            vm.Categories = model.Categories;
            vm.CategoryNames = categories ? categories.filter(x => model.Categories.find(y => x.Id === y)).map(x => new LanguagePipe().transform(x.Name)) : [];
            viewModels.push(vm);
        }

        return viewModels;
    }

    private bindDataSource(): void {
        const queryParams = new QueryParamsModel(this.filterConfiguration());

        this.viewData.dataSource.init(this.viewData.brands$, queryParams);
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "BRANDS.LIST", page: '/brands' }
        ]);
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0))
        );

        this._obsers.push(
            this._brandsState.subCategories$.subscribe(res => {
                if (res) {
                    this.viewData.categories = res;

                    this.viewControl.readyConditions.set("Categories", true);

                    this.init();
                }
            })
        );

        this._obsers.push(
            this._globalState.userInfoSub$.subscribe(res => {
                if (res) {
                    this.viewData.userInfo = res;

                    this.viewControl.readyConditions.set("User", true);

                    this.init();
                }
            })
        );

        this._obsers.push(
            this.viewData.brands$.subscribe(res => {
                this.viewData.brandsStored = res;
            })
        );

        this._obsers.push(
            this.viewData.dataSource.entitySubject.subscribe(res => {
                this.loadAdditionalInfo(res);
            })
        );
    }

    private async loadAdditionalInfo(brands: BrandViewModel[]) {
        let ids: string[] = [];

        for (let brand of brands) {
            if (this.viewData.additionalInfo.filter(x => x.Id === brand.Id).length === 0)
                ids.push(brand.Id);
        }

        if (ids.length === 0)
            return;

        let models = await this._brandService.findByIds(ids, [RoleType.Supervisor]);

        this.viewData.additionalInfo = this.viewData.additionalInfo.concat(models);

        this._changeRef.detectChanges();
    }

    private bindEvents(): void {
        this._obsers.push(
            merge(this.paginator.page)
                .pipe(
                    tap(() => {
                        this.loadBrands();
                    })
                )
                .subscribe()
        );

        this._obsers.push(
            merge(this.sort.sortChange)
                .pipe(
                    tap(() => {
                        this.loadBrands();
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
                        this.saveFilter('text', this.searchInput.nativeElement.value);
                        this.loadBrands();
                    })
                )
                .subscribe()
        );
    }

    private saveFilter(key: string, value: any) {
        this._filter[key] = value;

        this._filterStorageService.set(BrandsListPage.name, this._filter);
    }

    private initFilter() {
        this._filter = this._filterStorageService.get(BrandsListPage.name);

        if (this._filter) {
            this.viewFilter.filterStatus = this._filter['status'] || "";
            this.viewFilter.filterCategory = this._filter['category'] || "";
            this.searchInput.nativeElement.value = this._filter['text'] || "";
        } else {
            this._filter = {};
        }
    }
}
