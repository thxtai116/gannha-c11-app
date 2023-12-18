import { ChangeDetectionStrategy, Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';

import { BehaviorSubject, merge, fromEvent } from 'rxjs';
import { tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

import {
	LocalStorageKey,

	CollectionsDataSource,

	CollectionModel,
	CollectionOverviewViewModel,
	QueryParamsModel,

	ConfirmService,
	SubheaderService,
	FilterStorageService,
	CollectionService,
	CollectionTransformer,
	StorageUtility,
} from '../../../../../../core/core.module';

@Component({
	selector: 'm-collections-list',
	templateUrl: './collections-list.page.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollectionsListPage implements OnInit {

	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;

	private _obsers: any[] = [];
	private _filter: any = {};

	lang: string = "vi";

	viewControl: any = {
		loading$: new BehaviorSubject<boolean>(false),
		draftMode: false,
	};

	viewData: any = {
		displayedColumns: ["Index", "Title", "StartDate", "EndDate", "Status", "Actions"],
		dataSource: new CollectionsDataSource(),
		collections$: new BehaviorSubject<CollectionOverviewViewModel[]>([]),
		collectionsResult: new Array<CollectionOverviewViewModel>(),
		collectionsStored: new Array<CollectionOverviewViewModel>(),

		collectionDraftsStored: new Array<CollectionOverviewViewModel>(),
	};

	viewFilter: any = {
		filterStatus: ""
	};

	constructor(
		private _subheaderService: SubheaderService,
		private _confirmService: ConfirmService,
		private _translate: TranslateService,
		private _collectionService: CollectionService,
		private _filterStorageService: FilterStorageService,
		private _collectionTransformer: CollectionTransformer,
		private _storageUtil: StorageUtility,
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
		this.loadCollections();
		this.saveFilter('status', this.viewFilter.filterStatus);
	}

	refresh(): void {
		this.viewControl.loading$.next(true);

		Promise.all([
			this._collectionService.getAll()
		]).then(value => {
			let collections = value[0];
			let vms = collections.map(value => {
				return this._collectionTransformer.toCollectionOverview(value);
			});

			this.viewData.collections$.next(vms);

			this.loadCollections();

			this.viewControl.loading$.next(false);
		}).catch(() => {
			this.viewControl.loading$.next(false);
		});
	}

	refreshDraft(): void {
		this.viewControl.loading$.next(true);

		let drafts = JSON.parse(this._storageUtil.get(LocalStorageKey.draftCollections)) || [];

		this.viewData.collectionDraftsStored = drafts.map(value => {
			return this._collectionTransformer.toCollectionOverview(value);
		});

		this.loadCollectionDrafts();

		this.viewControl.loading$.next(false);
	}

	toggleDraftMode(): void {
		this.viewControl.draftMode = !this.viewControl.draftMode;

		if (this.viewControl.draftMode) {
			this.loadCollectionDrafts();
		} else {
			this.loadCollections();
		}
	}

	deleteDraft(id: string) {
		const dialogRef = this._confirmService.show(this._translate.instant('COMMON.CONFIRMATION'), this._translate.instant('COLLECTIONS.DELETE_DRAFT_COMFIRM'));

		let sub = dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			let currentList: CollectionModel[] = JSON.parse(this._storageUtil.get(LocalStorageKey.draftCollections));

			let index = currentList.findIndex(x => x.Id == id);
			currentList.splice(index, 1);
			this._storageUtil.set(LocalStorageKey.draftCollections, JSON.stringify(currentList));

			let drafts = JSON.parse(this._storageUtil.get(LocalStorageKey.draftCollections)) || [];

			this.viewData.collectionDraftsStored = drafts.map(value => {
				return this._collectionTransformer.toCollectionOverview(value);
			});

			this.loadCollectionDrafts();
		});

		this._obsers.push(sub);
	}

	private init(): void {
		let drafts = JSON.parse(this._storageUtil.get(LocalStorageKey.draftCollections)) || [];

		this.viewData.collectionDraftsStored = drafts.map(value => {
			return this._collectionTransformer.toCollectionOverview(value);
		});

		this.bindBreadcrumbs();

		Promise.all([
			this._collectionService.getAll()
		]).then(value => {
			let collections = value[0];
			let vms = collections.map(value => {
				return this._collectionTransformer.toCollectionOverview(value);
			});

			this.viewData.collections$.next(vms);

			this.loadCollections();

			this.viewControl.loading$.next(false);
		}).catch(() => {
			this.viewControl.loading$.next(false);
		});

		this.bindDataSource();
		this.bindEvents();
	}

	private bindDataSource(): void {
		const queryParams = new QueryParamsModel(this.filterConfiguration());

		this.viewData.dataSource.init(this.viewData.collections$, queryParams);
	}

	private loadCollections(): void {
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);

		this.viewData.dataSource.load(this.viewData.collectionsStored, queryParams);
	}

	private loadCollectionDrafts() {
		const queryParams = new QueryParamsModel(
			{ Status: "", Title: this.searchInput.nativeElement.value },
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);

		this.viewData.dataSource.load(this.viewData.collectionDraftsStored, queryParams);
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
			{ title: "COLLECTIONS.LIST", page: '/collections' }
		]);
	}

	private bindSubscribes(): void {
		this._obsers.push(
			this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0))
		);

		this._obsers.push(
			this.viewData.dataSource.entitySubject.subscribe(res => {
				this.viewData.collectionsResult = res;
			})
		);

		this._obsers.push(
			this.viewData.collections$.subscribe(res => {
				this.viewData.collectionsStored = res;
			})
		);
	}

	private bindEvents(): void {
		this._obsers.push(
			merge(this.sort.sortChange, this.paginator.page)
				.pipe(
					tap(() => {
						if (!this.viewControl.draftMode) {
							this.loadCollections();
						} else {
							this.loadCollectionDrafts();
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
							this.loadCollections();
							this.saveFilter('text', this.searchInput.nativeElement.value);
						} else {
							this.loadCollectionDrafts();
						}
					})
				)
				.subscribe()
		);
	}

	private saveFilter(key: string, value: any) {
		this._filter[key] = value;

		this._filterStorageService.set(CollectionsListPage.name, this._filter);
	}

	private initFilter() {
		this._filter = this._filterStorageService.get(CollectionsListPage.name);

		if (this._filter) {
			this.searchInput.nativeElement.value = this._filter['text'] || "";
			this.viewFilter.filterStatus = this._filter['status'] || "";
		} else {
			this._filter = {};
		}
	}
}
