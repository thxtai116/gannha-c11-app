import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import {
	UserService,
	SystemAlertService,
	SubheaderService,
	TenantService,
	UserInfoModel,
	MinArray,
	ValidPhone
} from '../../../../../../core/core.module';
import { UsersState } from '../../states';

@Component({
	selector: 'm-users-form',
	templateUrl: './users-form.page.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersFormPage implements OnInit {

	private _obsers: any[] = [];

	private _readyConditions: Map<string, boolean> = new Map([
		["Roles", false]
	]);

	viewControl: any = {
		loading$: new BehaviorSubject<Boolean>(false),
		submitting: false,
		ready: false
	}

	viewData: any = {
		acceptableRoles: new Array<any>(),
	}

	form: FormGroup;

	constructor(
		private _usersState: UsersState,
		private _tenantService: TenantService,
		private _subheaderService: SubheaderService,
		private _systemAlertService: SystemAlertService,
		private _translate: TranslateService,
	) {
		this.form = this.generateFormGroup();
	}

	ngOnInit(): void {
		this.viewControl.loading$.next(true);

		if (this._usersState.acceptableRoles$.getValue()) {
			this.viewData.acceptableRoles = this._usersState.acceptableRoles$.getValue();
		}

		this.bindSubscribes();

		this.viewControl.loading$.next(false);
	}

	ngOnDestroy(): void {
		for (let obs of this._obsers) {
			obs.unsubscribe();
		}
	}

	save() {
		const controls = this.form.controls;

		if (this.form.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this._systemAlertService.error(this._translate.instant("COMMON.ERROR.FORM_INVALID"));

			return;
		}

		this.createUser();
	}

	private init(): void {
		if (Array.from(this._readyConditions.values()).filter(x => x === false).length === 0) {
			if (this.viewControl.ready)
				return;

			this.viewControl.ready = true;

			this.bindBreadcrumbs();

			this.viewControl.loading$.next(false);
		}
	}

	private bindSubscribes(): void {
		this._obsers.push(
			this._usersState.acceptableRoles$.subscribe(value => {
				if (value) {
					this.viewData.acceptableRoles = value;

					this._readyConditions.set("Roles", true);

					this.init();
				}
			})
		);

		this._obsers.push(
			this._translate.onLangChange.subscribe(() => {
				this.bindBreadcrumbs();
			})
		);
	}

	private parseUserForm(form: FormGroup): UserInfoModel {
		let user = new UserInfoModel();

		user.FirstName = form.get('FirstName').value;
		user.LastName = form.get('LastName').value;
		user.Email = form.get('Email').value;
		user.PhoneNumber = form.get('Phone').value;
		user.Contract = form.get('ContractCode').value;
		user.Roles = form.get('Role').value;

		return user;
	}

	private async createUser() {
		if (this.viewControl.submitting) {
			return;
		}
		this.viewControl.submitting = true;

		this.viewControl.loading$.next(true);

		let user = this.parseUserForm(this.form);

		let data = await this._tenantService.createUser(user);

		this.viewControl.submitting = false;

		this.viewControl.loading$.next(false);

		if (data) {
			this._systemAlertService.success(this._translate.instant("USERS.CREATED_SUCCESS"));
			this.form.reset();
		}
	}

	private bindBreadcrumbs(): void {
		this._subheaderService.setBreadcrumbs([
			{ title: "USERS.LIST", page: '/users' },
			{ title: "USERS.NEW_USER", page: '/users/create' }
		]);
	}

	private generateFormGroup(): FormGroup {
		return new FormGroup({
			FirstName: new FormControl('', [<any>Validators.required]),
			LastName: new FormControl('', [<any>Validators.required]),
			Email: new FormControl('', [<any>Validators.required, MinArray.validate(5)]),
			Phone: new FormControl('', [<any>Validators.required, ValidPhone.validate()]),
			Role: new FormControl('', [<any>Validators.required]),
			ContractCode: new FormControl(''),
		});
	}
}
