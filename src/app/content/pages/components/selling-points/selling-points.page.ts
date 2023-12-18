import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import {
	BrandModel,

	GlobalState,
	SellingPointIconModel,
	CatalogService,
} from '../../../../core/core.module';

import { SellingPointsState } from './states';

@Component({
	selector: 'm-selling-points',
	templateUrl: './selling-points.page.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SellingPointsPage implements OnInit {

	private _obsers: any[] = [];
	private _brand: BrandModel = new BrandModel();

	constructor(
		private _globalState: GlobalState,
		private _sellingPointsState: SellingPointsState,
		private _catalogService: CatalogService,
	) {
	}

	ngOnInit(): void {
        Promise.all([
            this._catalogService.getSellingPointIcons(),
        ]).then(async value => {
            this._sellingPointsState.icons$.next(this.initFilterIcon(value[0]));
		});
		
		this.bindSubscribes();
	}

	ngOnDestroy(): void {
		for (let obs of this._obsers) {
			obs.unsubscribe();
		}
	}

    private initFilterIcon(icons: SellingPointIconModel[]): any[] {
        return icons.map(x => {
            return {
                id: x.Icon[0],
                text: x.Name["vi"]
            }
        });
	}
	
	private bindSubscribes(): void {
		this._obsers.push(
			this._globalState.brand$.subscribe(value => {
				if (value) {
					this._brand = value;

					this._sellingPointsState.brand$.next(this._brand);
				}
			})
		);
	}
}
