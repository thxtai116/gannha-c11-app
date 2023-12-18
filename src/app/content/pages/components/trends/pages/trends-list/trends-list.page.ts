import { ChangeDetectionStrategy, Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';

import {
	CollectionsDataSource,
	TrendOverviewViewModel,

	SubheaderService,

	TrendService,

	QueryParamsModel,

	TrendTransformer,
	FilterStorageService
} from '../../../../../../core/core.module';

import { BehaviorSubject, merge, fromEvent } from 'rxjs';
import { tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
	selector: 'm-trends-list',
	templateUrl: './trends-list.page.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrendsListPage implements OnInit {

	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;

	private _obsers: any[] = [];
	private _filter: any = {};

	lang: string = "vi";

	viewControl: any = {
		loading$: new BehaviorSubject<boolean>(false)
	};

	viewData: any = {
		displayedColumns: ["Index", "Name", "StartDate", "EndDate", "Status", "Actions"],
		dataSource: new CollectionsDataSource(),
		trends$: new BehaviorSubject<TrendOverviewViewModel[]>([]),
		trendsResult: new Array<TrendOverviewViewModel>(),
		trendsStored: new Array<TrendOverviewViewModel>()
	};

	viewFilter: any = {
		filterStatus: ""
	};

	constructor(
		private _subheaderService: SubheaderService,
		private _filterStorageService: FilterStorageService,
		private _trendService: TrendService,
		private _trendTransformer: TrendTransformer
	) {
	}

	ngOnInit(): void {
		this.viewControl.loading$ = this.viewData.dataSource.loadingSubject;
		this.viewControl.loading$.next(true);

		this.initFilter();
		this.init();

		this.bindSubscribes();
	}

	ngOnDestroy(): void {
		for (let obs of this._obsers) {
			obs.unsubscribe();
		}
	}

	onStatusSelected() {
		this.loadTrends();
		this.saveFilter('status', this.viewFilter.filterStatus)
	}

	loadTrends(): void {
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);

		this.viewData.dataSource.load(this.viewData.trendsStored, queryParams);
	}

	refresh(): void {
		this.viewControl.loading$.next(true);

		this.fetchTrends();
	}

	private fetchTrends(): void {
		Promise.all([
			this._trendService.getAll()
		]).then(value => {
			let trends = value[0];
			let vms = trends.map(value => {
				return this._trendTransformer.toTrendOverview(value);
			});

			this.viewData.trends$.next(vms);

			this.loadTrends();

			this.viewControl.loading$.next(false);
		}).catch(() => {
			this.viewControl.loading$.next(false);
		});
	}

	private init(): void {
		this.bindBreadcrumbs();
		this.fetchTrends();
		this.bindDataSource();
		this.bindEvents();
	}

	private bindDataSource(): void {
		const queryParams = new QueryParamsModel(this.filterConfiguration());

		this.viewData.dataSource.init(this.viewData.trends$, queryParams);
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

	private bindBreadcrumbs(): void {
		this._subheaderService.setBreadcrumbs([
			{ title: "TRENDS.LIST", page: '/trend-categories' }
		]);
	}

	private bindSubscribes(): void {
		this._obsers.push(
			this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0))
		);

		this._obsers.push(
			this.viewData.dataSource.entitySubject.subscribe(res => {
				this.viewData.trendsResult = res;
			})
		);

		this._obsers.push(
			this.viewData.trends$.subscribe(res => {
				this.viewData.trendsStored = res;
			})
		);
	}

	private bindEvents(): void {
		this._obsers.push(
			merge(this.sort.sortChange, this.paginator.page)
				.pipe(
					tap(() => {
						this.loadTrends();
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
						this.loadTrends();
						this.saveFilter('text', this.searchInput.nativeElement.value);
					})
				)
				.subscribe()
		);
	}

	private saveFilter(key: string, value: any) {
		this._filter[key] = value;

		this._filterStorageService.set(TrendsListPage.name, this._filter);
	}

	private initFilter() {
		this._filter = this._filterStorageService.get(TrendsListPage.name);

		if (this._filter) {
			this.searchInput.nativeElement.value = this._filter['text'] || "";
			this.viewFilter.filterStatus = this._filter['status'] || "";
		} else {
			this._filter = {};
		}
	}
}
