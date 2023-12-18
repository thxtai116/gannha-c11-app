import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import { UsersState } from './states';

import { TenantService, CategoryService, BrandService, CategoryUtility } from '../../../../core/core.module';

@Component({
	selector: 'm-users',
	templateUrl: './users.page.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersPage implements OnInit {

	constructor(
		private _usersState: UsersState,
		private _tenantService: TenantService,
		private _categoryService: CategoryService,
		private _brandsService: BrandService,
		private _categoryUtil: CategoryUtility
	) {
	}

	ngOnInit(): void {
		Promise.all([
			//this._tenantService.getAcceptableRoles(),
			this._categoryService.getAll(),
			this._brandsService.getAllShort(),
		]).then(value => {
			//this._usersState.acceptableRoles$.next(value[0]);

			// let subs = this._categoryUtil.getSubCategories(value[1]);

			// this._usersState.subCategories$.next(subs);
			// this._usersState.brands$.next(value[2]);

			let subs = this._categoryUtil.getSubCategories(value[0]);

			this._usersState.subCategories$.next(subs);
			this._usersState.brands$.next(value[1]);
		});
	}
}
