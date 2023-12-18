import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import {
	BrandModel,

	GlobalState,
	AreaService,
} from '../../../../core/core.module';

import { UnitsState } from './states';

@Component({
	selector: 'm-units',
	templateUrl: './units.page.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnitsPage implements OnInit {

	private _obsers: any[] = [];
	private _brand: BrandModel = new BrandModel();

	constructor(
		private _globalState: GlobalState,
		private _unitsState: UnitsState,
		private _areaService: AreaService,
	) {
	}

	ngOnInit(): void {
		this.bindSubscribes();

		Promise.all([
			this._areaService.getProvinces()
		]).then(value => {
			this._unitsState.provinces$.next(value[0]);
		});
	}

	ngOnDestroy(): void {
		for (let obs of this._obsers) {
			obs.unsubscribe();
		}
	}

	private bindSubscribes(): void {
		this._obsers.push(
			this._globalState.brand$.subscribe(value => {
				if (value) {
					this._brand = value;

					this._unitsState.brand$.next(this._brand);
				}
			})
		);
	}
}
