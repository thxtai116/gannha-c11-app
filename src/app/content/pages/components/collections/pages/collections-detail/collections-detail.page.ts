import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { MenuItemModel, CollectionService } from '../../../../../../core/core.module';

import { CollectionsDetailState } from '../../states';

@Component({
	selector: 'm-collections-detail',
	templateUrl: './collections-detail.page.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollectionsDetailPage implements OnInit {

	private _obsers: any[] = [];

	menu: MenuItemModel[] = [];

	constructor(
		private _route: ActivatedRoute,
		private _collectionService: CollectionService,
		private _collectionsDetailState: CollectionsDetailState,
	) {
	}

	ngOnInit(): void {
		if (this._collectionsDetailState.menu$.getValue()) {
			this.menu = this._collectionsDetailState.menu$.getValue();
		}

		let id = this._route.snapshot.params["id"];

		if (id) {
			Promise.all([
				this._collectionService.get(id),
			]).then(value => {
				if (value[0]) {
					this._collectionsDetailState.collection$.next(value[0]);
				}
			});
		}

		this.bindSubscribes();
	}

	ngOnDestroy(): void {
		for (let obs of this._obsers) {
			obs.unsubscribe();
		}

		this._collectionsDetailState.collection$.next(null);
	}

	private bindSubscribes(): void {
		this._obsers.push(
			this._collectionsDetailState.menu$.subscribe(value => {
				if (value) {
					this.menu = value;
				}
			})
		);
	}
}
