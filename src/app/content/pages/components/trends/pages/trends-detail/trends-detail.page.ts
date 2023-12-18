import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import {
	MenuItemModel,
	TrendService
} from '../../../../../../core/core.module';

import { TrendsDetailState } from '../../states';

@Component({
	selector: 'm-trends-detail',
	templateUrl: './trends-detail.page.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrendsDetailPage implements OnInit {

	private _obsers: any[] = [];

	menu: MenuItemModel[] = [];

	constructor(
		private _route: ActivatedRoute,
		private _trendService: TrendService,
		private _trendsDetailState: TrendsDetailState,
	) {
	}

	ngOnInit(): void {
		if (this._trendsDetailState.menu$.getValue()) {
			this.menu = this._trendsDetailState.menu$.getValue();
		}

		let id = this._route.snapshot.params["id"];

		if (id) {
			Promise.all([
				this._trendService.get(id, true),
			]).then(value => {
				if (value[0]) {
					this._trendsDetailState.trend$.next(value[0]);
				}
			});
		}

		this.bindSubscribes();
	}

	ngOnDestroy(): void {
		for (let obs of this._obsers) {
			obs.unsubscribe();
		}

		this._trendsDetailState.trend$.next(null);
	}

	private bindSubscribes(): void {
		this._obsers.push(
			this._trendsDetailState.menu$.subscribe(value => {
				if (value) {
					this.menu = value;
				}
			})
		);
	}
}
