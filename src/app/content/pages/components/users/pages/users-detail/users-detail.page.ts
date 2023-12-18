import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { BehaviorSubject } from 'rxjs';

import {
	MenuItemModel,
	UserInfoModel,

	TenantService
} from '../../../../../../core/core.module';

import { UsersDetailState } from '../../states';

@Component({
	selector: 'm-users-detail',
	templateUrl: './users-detail.page.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersDetailPage implements OnInit {

	private _obsers: any[] = [];
	private _id: string = "";
	private _user: UserInfoModel = new UserInfoModel();

	menu$: BehaviorSubject<MenuItemModel[]> = new BehaviorSubject<MenuItemModel[]>(null);

	constructor(
		private _route: ActivatedRoute,
		private _tenantService: TenantService,
		private _usersDetailState: UsersDetailState
	) {
	}

	ngOnInit(): void {
		this.menu$ = this._usersDetailState.menu$;

		this._id = this._route.snapshot.params["id"];

		if (this._id) {
			Promise.all([
				this._tenantService.getUserById(this._id)
			]).then(value => {
				this._user = value[0];

				this._usersDetailState.user$.next(this._user);
			});
		}
	}

	ngOnDestroy(): void {
		for (let obs of this._obsers) {
			obs.unsubscribe();
		}

		this._usersDetailState.user$.next(null);
	}
}
