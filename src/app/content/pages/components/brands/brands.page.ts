import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import {
	CategoryService,
	UtilityService,

	GlobalState,

	CategoryUtility
} from "../../../../core/core.module";

import { BrandsState } from "./states/index";
import { BehaviorSubject } from 'rxjs';

@Component({
	selector: 'm-brands',
	templateUrl: './brands.page.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrandsPage implements OnInit {

	private _obsers: any[] = [];
	private _ready: boolean = false;

	ready$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	constructor(
		private _categoryService: CategoryService,
		private _utilityService: UtilityService,
		private _categoryUtil: CategoryUtility,
		private _brandsState: BrandsState,
		private _globalState: GlobalState
	) {
	}

	ngOnInit(): void {
		if (this._globalState.authenticated$.getValue()) {
			this.fetchInitialData();

			this._brandsState.ready$.next(true);
		}

		this.bindSubscribes();
	}

	ngOnDestroy(): void {
		for (let obs of this._obsers) {
			obs.unsubscribe();
		}
	}

	private fetchInitialData(): void {
		if (this._ready)
			return;

		this._ready = true;

		Promise.all([
			this._categoryService.getAll(),
			this._utilityService.getAll()
		]).then(value => {
			this._brandsState.categogies$.next(value[0]);
			this._brandsState.utilities$.next(value[1]);

			var subCategories = this._categoryUtil.getSubCategories(value[0]);

			this._brandsState.subCategories$.next(subCategories);
		});
	}

	private bindSubscribes(): void {
		this._obsers.push(
			this._globalState.authenticated$.subscribe(value => {
				if (value) {
					this.fetchInitialData();

					this._brandsState.ready$.next(true);
				}
			})
		);
	}
}
