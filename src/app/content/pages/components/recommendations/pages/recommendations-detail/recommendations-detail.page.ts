import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { MenuItemModel, RecommendationService } from '../../../../../../core/core.module';

import { RecommendationsDetailState } from '../../states';

@Component({
	selector: 'm-recommendations-detail',
	templateUrl: './recommendations-detail.page.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecommendationsDetailPage implements OnInit {

	private _obsers: any[] = [];

	menu: MenuItemModel[] = [];

	constructor(
		private _route: ActivatedRoute,
		private _recommendationService: RecommendationService,
		private _recommendationsDetailState: RecommendationsDetailState,
	) {
	}

	ngOnInit(): void {
		if (this._recommendationsDetailState.menu$.getValue()) {
			this.menu = this._recommendationsDetailState.menu$.getValue();
		}

		let id = this._route.snapshot.params["id"];

		if (id) {
			Promise.all([
				this._recommendationService.get(id, true),
			]).then(value => {
				if (value[0]) {
					this._recommendationsDetailState.recommendation$.next(value[0]);
				}
			});
		}

		this.bindSubscribes();
	}

	ngOnDestroy(): void {
		for (let obs of this._obsers) {
			obs.unsubscribe();
		}

		this._recommendationsDetailState.recommendation$.next(null);
	}

	private bindSubscribes(): void {
		this._obsers.push(
			this._recommendationsDetailState.menu$.subscribe(value => {
				if (value) {
					this.menu = value;
				}
			})
		);
	}
}
