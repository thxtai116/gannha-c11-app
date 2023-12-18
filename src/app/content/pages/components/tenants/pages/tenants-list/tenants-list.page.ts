import { ChangeDetectionStrategy, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatSort, MatPaginator } from '@angular/material';

import { BehaviorSubject, merge, fromEvent } from 'rxjs';

import {
	TenantsDataSource,

	SubheaderService,
	TenantService,

	QueryParamsModel,

	TenantTransformer,

	TenantOverviewViewModel,
	FilterStorageService
} from '../../../../../../core/core.module';
import { tap, distinctUntilChanged, debounceTime } from 'rxjs/operators';

@Component({
	selector: 'm-tenants-list',
	templateUrl: './tenants-list.page.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TenantsListPage implements OnInit {

	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;

	private _obsers: any[] = [];
	private _filter: any = {};

	viewControl: any = {
		loading$: new BehaviorSubject<boolean>(false)
	};

	viewFilter: any = {
		filterStatus: ""
	};

	viewData: any = {
		displayedColumns: ["Index", "Name", "OwnerName", "Status", "Actions"],
		dataSource: new TenantsDataSource(),
		tenants$: new BehaviorSubject<TenantOverviewViewModel[]>([]),
		tenantsResult: new Array<TenantOverviewViewModel>(),
		tenantsStored: new Array<TenantOverviewViewModel>()
	};

	constructor(
		private _subheaderService: SubheaderService,
		private _tenantService: TenantService,
		private _filterStorageService: FilterStorageService,
		private _tenantTransformer: TenantTransformer
	) {
	}

	ngOnInit(): void {
		this.viewControl.loading$ = this.viewData.dataSource.loadingSubject;
		this.viewControl.loading$.next(true);

		this.initFilter();
		this.init();
		this.bindSubscribes();
	}

	onStatusChange(): void {
		this.saveFilter('status', this.viewFilter.filterStatus);

		this.loadTenants();
	}

	loadTenants(): void {
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);

		this.viewData.dataSource.load(this.viewData.tenantsStored, queryParams);
	}

	refresh(): void {
		this.viewControl.loading$.next(true);

		Promise.all([
			this._tenantService.getAll(true)
		]).then(value => {
			let tenants = value[0];
			let vms = tenants.map(value => {
				return this._tenantTransformer.toTenantOverView(value);
			});

			this.viewData.tenants$.next(vms);

			this.loadTenants();

			this.viewControl.loading$.next(false);
		}).catch(() => {
			this.viewControl.loading$.next(false);
		});
	}

	private init(): void {
		this.bindBreadcrumbs();

		Promise.all([
			this._tenantService.getAll()
		]).then(value => {
			let tenants = value[0];
			let vms = tenants.map(value => {
				return this._tenantTransformer.toTenantOverView(value);
			});

			this.viewData.tenants$.next(vms);

			this.loadTenants();

			this.viewControl.loading$.next(false);
		}).catch(() => {
			this.viewControl.loading$.next(false);
		});

		this.bindDataSource();
		this.bindEvents();
	}

	private bindSubscribes(): void {
		this._obsers.push(
			this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0))
		);

		this._obsers.push(
			this.viewData.dataSource.entitySubject.subscribe(res => {
				this.viewData.tenantsResult = res;
			})
		);

		this._obsers.push(
			this.viewData.tenants$.subscribe(res => {
				this.viewData.tenantsStored = res;
			})
		);
	}

	private filterConfiguration(): any {
		const filter: any = {};

		const searchText: string = this.searchInput.nativeElement.value;

		if (this.viewFilter.filterStatus && this.viewFilter.filterStatus.length > 0) {
			filter.Status = this.viewFilter.filterStatus;
		}

		filter.filterGroup = {
			Name: searchText,
			OwnerName: searchText,
		}

		return filter;
	}

	private bindDataSource(): void {
		const queryParams = new QueryParamsModel(this.filterConfiguration());

		this.viewData.dataSource.init(this.viewData.tenants$, queryParams);
	}

	private bindBreadcrumbs(): void {
		this._subheaderService.setBreadcrumbs([
			{ title: "TENANTS.LIST", page: '/tenants' }
		]);
	}

	private bindEvents(): void {
		this._obsers.push(
			merge(this.sort.sortChange, this.paginator.page)
				.pipe(
					tap(() => {
						this.loadTenants();
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
						this.loadTenants();
					})
				)
				.subscribe()
		);
	}

	private saveFilter(key: string, value: any) {
		this._filter[key] = value;

		this._filterStorageService.set(TenantsListPage.name, this._filter);
	}

	private initFilter() {
		this._filter = this._filterStorageService.get(TenantsListPage.name);

		if (this._filter) {
			this.viewFilter.filterStatus = this._filter['status'] || "";
			this.searchInput.nativeElement.value = this._filter['text'] || "";
		} else {
			this._filter = {};
		}
	}
}
