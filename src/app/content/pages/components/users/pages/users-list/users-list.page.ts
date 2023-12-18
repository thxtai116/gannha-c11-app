import { ChangeDetectionStrategy, Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';
import { BehaviorSubject, merge, fromEvent } from 'rxjs';

import {
	UsersDataSource,

	UserInfoOverviewViewModel,

	SubheaderService,
	TenantService,

	QueryParamsModel,

	UserTransformer,
	FilterStorageService
} from '../../../../../../core/core.module';

import { UsersState } from '../../states';
import { tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'm-users-list',
	templateUrl: './users-list.page.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersListPage implements OnInit {

	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;

	private _obsers: any[] = [];
	private _filter: any = {};

	private readyConditions: any = new Map([
		//["Roles", false]
	])

	viewControl: any = {
		ready: false,
		loading$: new BehaviorSubject<boolean>(false)
	};

	viewFilter: any = {
		filterStatus: "2",
		filterRole: ""
	};

	viewData: any = {
		displayedColumns: ["Index", "Name", "Email", "Role", "Status", "Actions"],
		dataSource: new UsersDataSource(),
		roles: new Array<any>(),
		users$: new BehaviorSubject<UserInfoOverviewViewModel[]>([]),
		usersResult: new Array<UserInfoOverviewViewModel>(),
		usersStored: new Array<UserInfoOverviewViewModel>()
	}

	constructor(
		private _subheaderService: SubheaderService,
		private _tenantService: TenantService,
		private _usersState: UsersState,
		private _translate: TranslateService,
		private _filterStorageService: FilterStorageService,
		private _userTransformer: UserTransformer,
	) {
	}

	ngOnInit(): void {
		this.viewControl.loading$ = this.viewData.dataSource.loadingSubject;
		this.viewControl.loading$.next(true);

		this.initFilter();

		// if (this._usersState.acceptableRoles$.getValue()) {
		// 	this.viewData.roles = this._usersState.acceptableRoles$.getValue();

		// 	this.readyConditions.set("Roles", true);

		// 	this.init();
		// }

		this.init();

		this.bindSubscribes();
	}

	ngOnDestroy(): void {
		for (let obs of this._obsers) {
			obs.unsubscribe();
		}
	}

	onStatusChange(): void {
		this.saveFilter('status', this.viewFilter.filterStatus);

		this.loadUsers();
	}

	onRoleChange(): void {
		this.saveFilter('role', this.viewFilter.filterRole);

		this.loadUsers();
	}

	loadUsers(): void {
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);

		this.viewData.dataSource.load(this.viewData.usersStored, queryParams);
	}

	refresh(): void {
		this.viewControl.loading$.next(true);

		Promise.all([
			this._tenantService.getUsers()
		]).then(value => {
			let vms = value[0].map(x => this._userTransformer.toUserInfoOverviewViewModel(x));

			this.viewData.users$.next(vms);

			this.viewControl.loading$.next(false);
		}).catch(() => {
			this.viewControl.loading$.next(false);
		})
	}

	private init(): void {
		if (Array.from(this.readyConditions.values()).filter(x => x === false).length === 0) {
			if (this.viewControl.ready) return;

			this.viewControl.ready = true;

			Promise.all([
				this._tenantService.getUsers()
			]).then(value => {
				let vms = value[0].map(x => this._userTransformer.toUserInfoOverviewViewModel(x));

				this.viewData.users$.next(vms);

				this.viewControl.loading$.next(false);
			}).catch(() => {
				this.viewControl.loading$.next(false);
			})

			this.bindBreadcrumbs();
			this.bindDataSource();
			this.bindEvents();
		}
	}

	private filterConfiguration(): any {
		const filter: any = {};

		const searchText: string = this.searchInput.nativeElement.value;

		if (this.viewFilter.filterStatus && this.viewFilter.filterStatus.length > 0) {
			filter.Status = this.viewFilter.filterStatus;
		}

		if (this.viewFilter.filterRole && this.viewFilter.filterRole.length > 0) {
			filter.Role = this.viewFilter.filterRole;
		}

		filter.filterGroup = {
			Name: searchText,
			Email: searchText,
		}

		return filter;
	}

	private bindDataSource(): void {
		const queryParams = new QueryParamsModel(this.filterConfiguration());

		this.viewData.dataSource.init(this.viewData.users$, queryParams);
	}

	private bindBreadcrumbs(): void {
		this._subheaderService.setBreadcrumbs([
			{ title: "USERS.LIST", page: '/users' }
		]);
	}

	private bindSubscribes(): void {
		this._obsers.push(
			this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0))
		);

		// this._obsers.push(
		// 	this._usersState.acceptableRoles$.subscribe(res => {
		// 		if (res) {
		// 			this.viewData.roles = res;

		// 			this.readyConditions.set("Roles", true);

		// 			this.init();
		// 		}
		// 	})
		// );

		this._obsers.push(
			this.viewData.dataSource.entitySubject.subscribe(res => {
				this.viewData.usersResult = res;
			})
		);

		this._obsers.push(
			this.viewData.users$.subscribe(res => {
				this.viewData.usersStored = res;
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
						this.loadUsers();
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
						this.loadUsers();
					})
				)
				.subscribe()
		);
	}

	private saveFilter(key: string, value: any) {
		this._filter[key] = value;

		this._filterStorageService.set(UsersListPage.name, this._filter);
	}

	private initFilter() {
		this._filter = this._filterStorageService.get(UsersListPage.name);

		if (this._filter) {
			this.viewFilter.filterStatus = this._filter['status'] || "2";
			this.viewFilter.filterRole = this._filter['role'] || "";
			this.searchInput.nativeElement.value = this._filter['text'] || "";
		} else {
			this._filter = {};
		}
	}
}
