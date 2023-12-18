import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

import {
	SubheaderService,
	TenantService,
	UserInfoModel,
	TenantModel,
	SystemAlertService
} from '../../../../../../core/core.module';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'm-tenants-form',
	templateUrl: './tenants-form.page.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TenantsFormPage implements OnInit, OnDestroy {

	private _obsers: any[] = [];

	viewControl: any = {
		loading$: new BehaviorSubject<boolean>(false),
		submitting: false
	};

	viewForm: any = {
		formGroup: FormGroup,
		tenantInfo: TenantModel,
		ownerInfo: UserInfoModel,
	}

	constructor(
		private _subheaderService: SubheaderService,
		private _tenantService: TenantService,
		private _systemAlertService: SystemAlertService,
		private _translate: TranslateService
	) {
		this.viewForm.formGroup = this.generateForm();
	}

	ngOnInit(): void {
		this.bindBreadcrumbs();
		this.bindSubscribes();
	}

	ngOnDestroy(): void {
		for (let obs of this._obsers) {
			obs.unsubscribe();
		}
	}

	save() {
		if (!this.viewForm.formGroup.valid) {
			const controls = this.viewForm.formGroup.controls;

			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this._systemAlertService.error(this._translate.instant("COMMON.ERROR.FORM_INVALID"));

			return;
		}

		this.parseTenantForm(this.viewForm.formGroup);
		this.createTenant();
	}

	async createTenant() {
		this.viewControl.loading$.next(true);

		let data = await this._tenantService.create(this.viewForm.tenantInfo, this.viewForm.ownerInfo);

		this.viewControl.loading$.next(false);

		if (data) {
			this._systemAlertService.success(this._translate.instant("TENANTS.CREATE_SUCCESSFUL"));
			this.viewForm.formGroup.reset();
		}
	}

	private parseTenantForm(formGroup: FormGroup) {
		this.viewForm.tenantInfo.CompanyName = formGroup.get('CompanyName').value;
		this.viewForm.tenantInfo.CompanyPhone = formGroup.get('CompanyPhone').value;
		this.viewForm.tenantInfo.CompanyAddress = formGroup.get('CompanyAddress').value;
		this.viewForm.tenantInfo.TaxCode = formGroup.get('TaxCode').value;
		this.viewForm.ownerInfo.FirstName = formGroup.get('FirstName').value;
		this.viewForm.ownerInfo.LastName = formGroup.get('LastName').value;
		this.viewForm.ownerInfo.Email = formGroup.get('Email').value;
	}

	private bindBreadcrumbs(): void {
		this._subheaderService.setBreadcrumbs([
			{ title: "TENANTS.LIST", page: '/tenants' },
			{ title: "TENANTS.NEW_TENANT", page: '/tenants/create' }
		]);
	}

	private bindSubscribes() {
		this._obsers.push(
			this._translate.onLangChange.subscribe(() => {
				this.bindBreadcrumbs();
			})
		);
	}

	private generateForm(): FormGroup {
		return new FormGroup({
			CompanyName: new FormControl('', [<any>Validators.required, <any>Validators.minLength(3)]),
			CompanyPhone: new FormControl('', [<any>Validators.required, <any>Validators.minLength(8)]),
			CompanyAddress: new FormControl('', [<any>Validators.required, <any>Validators.minLength(5)]),
			TaxCode: new FormControl('', [<any>Validators.required, <any>Validators.minLength(5)]),

			FirstName: new FormControl('', [<any>Validators.required]),
			LastName: new FormControl('', [<any>Validators.required]),
			Email: new FormControl('', [<any>Validators.required, <any>Validators.minLength(5)]),
		});
	}
}
