import { ChangeDetectionStrategy, Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';

import {
	RecommendationsDataSource,
	CollectionOverviewViewModel,
	SubheaderService,
	QueryParamsModel,
	RecommendationService,
	RecommendationTransformer,
	FilterStorageService
} from '../../../../../../core/core.module';

import { BehaviorSubject, merge, fromEvent } from 'rxjs';
import { tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
	selector: 'm-recommendations-list',
	templateUrl: './recommendations-list.page.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecommendationsListPage implements OnInit {

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
		displayedColumns: ["Index", "Name", "Title", "StartDate", "EndDate", "Status", "Actions"],
		dataSource: new RecommendationsDataSource(),
		recommendations$: new BehaviorSubject<CollectionOverviewViewModel[]>([]),
		recommendationsResult: new Array<CollectionOverviewViewModel>(),
		recommendationsStored: new Array<CollectionOverviewViewModel>()
	};

	viewFilter: any = {
		filterStatus: ""
	};

	constructor(
		private _subheaderService: SubheaderService,
		private _filterStorageService: FilterStorageService,
		private _recommendationService: RecommendationService,
		private _recommendationTransformer: RecommendationTransformer
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
		this.loadRecommendations();
		this.saveFilter('status', this.viewFilter.filterStatus)
	}

	refresh(): void {
		this.viewControl.loading$.next(true);

		this.fetchRecommendations();
	}

	private fetchRecommendations(): void {
		Promise.all([
			this._recommendationService.getAll()
		]).then(value => {
			let recommendations = value[0];
			let vms = recommendations.map(value => {
				return this._recommendationTransformer.toRecommendationOverview(value);
			});

			this.viewData.recommendations$.next(vms);

			this.loadRecommendations();

			this.viewControl.loading$.next(false);
		}).catch(() => {
			this.viewControl.loading$.next(false);
		});
	}

	private init(): void {
		this.bindBreadcrumbs();

		this.fetchRecommendations();

		this.bindDataSource();
		this.bindEvents();
	}

	private bindDataSource(): void {
		const queryParams = new QueryParamsModel(this.filterConfiguration());

		this.viewData.dataSource.init(this.viewData.recommendations$, queryParams);
	}

	private loadRecommendations(): void {
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);

		this.viewData.dataSource.load(this.viewData.recommendationsStored, queryParams);
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
			{ title: "RECOMMENDATIONS.LIST", page: '/recommendations' }
		]);
	}

	private bindSubscribes(): void {
		this._obsers.push(
			this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0))
		);

		this._obsers.push(
			this.viewData.dataSource.entitySubject.subscribe(res => {
				this.viewData.recommendationsResult = res;
			})
		);

		this._obsers.push(
			this.viewData.recommendations$.subscribe(res => {
				this.viewData.recommendationsStored = res;
			})
		);
	}

	private bindEvents(): void {
		this._obsers.push(
			merge(this.sort.sortChange, this.paginator.page)
				.pipe(
					tap(() => {
						this.loadRecommendations();
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
						this.loadRecommendations();
						this.saveFilter('text', this.searchInput.nativeElement.value)
					})
				)
				.subscribe()
		);
	}

	private saveFilter(key: string, value: any) {
		this._filter[key] = value;

		this._filterStorageService.set(RecommendationsListPage.name, this._filter);
	}

	private initFilter() {
		this._filter = this._filterStorageService.get(RecommendationsListPage.name);

		if (this._filter) {
			this.searchInput.nativeElement.value = this._filter['text'] || "";
			this.viewFilter.filterStatus = this._filter['status'] || "";
		} else {
			this._filter = {};
		}
	}
}
