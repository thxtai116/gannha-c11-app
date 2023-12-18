import {
	Component,
	OnInit,
	HostBinding,
	OnDestroy,
	ElementRef,
	AfterViewInit,
	ChangeDetectionStrategy,
	ViewChild,
	ChangeDetectorRef
} from '@angular/core';

import * as objectPath from 'object-path';

import { Subscription, Observable, fromEvent, BehaviorSubject } from 'rxjs';

import { QuickSearchDirective } from '../../../../../core/core.module';

import {
	BrandModel,

	LayoutConfigService,

	GlobalState,
	LanguagePipe,
} from '../../../../../core/core.module';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';

@Component({
	selector: 'm-search-dropdown',
	templateUrl: './search-dropdown.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchDropdownComponent implements OnInit, OnDestroy, AfterViewInit {

	@HostBinding('class') classes = '';
	@HostBinding('id') id = 'm_quicksearch';
	@HostBinding('attr.m-dropdown-toggle') attrDropdownToggle = 'click';
	@HostBinding('attr.m-dropdown-persistent') attrDropdownPersistent = '1';
	@HostBinding('attr.m-quicksearch-mode') attrQuicksearchMode = 'dropdown';
	@HostBinding('attr.mQuickSearch') mQuickSearchDirective: QuickSearchDirective;

	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;

	private _obsers: any[] = [];

	brand$: Observable<BrandModel> = new Observable<BrandModel>();
	brands: BrandModel[] = [];
	searchResult$: BehaviorSubject<BrandModel[]> = new BehaviorSubject<BrandModel[]>([]);

	onLayoutConfigUpdated: Subscription;

	viewControl: any = {
		loading$: new BehaviorSubject<boolean>(true)
	}

	constructor(
		private layoutConfigService: LayoutConfigService,
		private el: ElementRef,
		private _globalState: GlobalState
	) {
		this.layoutConfigService.onLayoutConfigUpdated$.subscribe(model => {
			const config = model.config;

			this.classes =
				'm-nav__item m-dropdown m-dropdown--large m-dropdown--arrow m-dropdown--align-center m-dropdown--mobile-full-width m-dropdown--skin-light m-list-search m-list-search--skin-light';

			this.classes +=
				' m-dropdown--skin-' +
				objectPath.get(config, 'header.search.dropdown.skin');
		});
	}

	ngOnInit(): void {
		this.brand$ = this._globalState.brand$.asObservable();

		if (this._globalState.brands$.getValue()) {
			this.brands = this._globalState.brands$.getValue();
		}

		this.bindSubscribes();
		this.bindEvents();
	}

	ngOnDestroy() {
		for (let obs of this._obsers) {
			obs.unsubscribe();
		}
	}

	ngAfterViewInit(): void {
		Promise.resolve(null).then(() => {
			this.mQuickSearchDirective = new QuickSearchDirective(this.el);
			this.mQuickSearchDirective.ngAfterViewInit();
		});
	}

	private bindEvents(): void {
		this._obsers.push(
			fromEvent(this.searchInput.nativeElement, 'keyup')
				.pipe(
					debounceTime(150),
					distinctUntilChanged(),
					tap(() => {
						this.doSearch(this.searchInput.nativeElement.value.toLowerCase());
					})
				)
				.subscribe()
		);
	}

	onBrandSelect(brand: BrandModel): void {
		this.viewControl.loading$.next(true);

		this._globalState.syncBrand.next(brand.Id);
	}

	private doSearch(query: string = ""): void {
		let searchResult = query.length === 0 ? this.brands : this.brands.filter(x => new LanguagePipe().transform(x.Name).toLowerCase().indexOf(query) > -1);
		let result = JSON.parse(JSON.stringify(searchResult));

		this.searchResult$.next(result);
	}

	private bindSubscribes(): void {
		this._obsers.push(
			this._globalState.brands$.subscribe(value => {
				if (value) {
					this.brands = value;

					this.doSearch();
				}
			})
		);

		this._obsers.push(
			this._globalState.brand$.subscribe(value => {
				if (value) {
					this.viewControl.loading$.next(false);
				}
			})
		);
	}
}
