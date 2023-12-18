import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { GlobalState } from '../../../../core/core.module';

import { TenantsState } from './states';

@Component({
	selector: 'm-tenants',
	templateUrl: './tenants.page.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TenantsPage implements OnInit {

	private _obsers: any[] = [];

	authenticated$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	constructor(
		private _globalState: GlobalState,
		private _tenantsState: TenantsState
	) {
	}

	ngOnInit(): void {
		if (this._globalState.authenticated$.getValue()) {

			this._tenantsState.authenticated$.next(true);
		}

		this.bindSubscribes();
	}

	private bindSubscribes(): void {
		this._obsers.push(
			this._globalState.authenticated$.subscribe(value => {
				if (value) {
					this._tenantsState.authenticated$.next(true);
				}
			})
		);
	}
}
