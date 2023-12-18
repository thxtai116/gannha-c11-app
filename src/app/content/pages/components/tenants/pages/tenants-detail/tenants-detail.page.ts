import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { TenantModel, SubheaderService, TenantService, Status } from '../../../../../../core/core.module';
import { TenantDetailViewModel } from '../../view-models';

import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'm-tenants-detail',
	templateUrl: './tenants-detail.page.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TenantsDetailPage implements OnInit, OnDestroy {
	private _obsers: any[] = [];

	lang: string = "vi";

	viewControl: any = {
		editMode: false,
		submitting: false,
		loading$: new BehaviorSubject<boolean>(false)
	}

	viewData: any = {
		tenant: new TenantModel()
	}

	viewModel: any = {
		tenant: new TenantDetailViewModel()
	}

	constructor(
		private _route: ActivatedRoute,
		private _subheaderService: SubheaderService,
		private _tenantService: TenantService,
		private _translate: TranslateService,
	) {
	}

	ngOnInit(): void {
		this.viewControl.loading$.next(true);

		let id = this._route.snapshot.params["id"];

		if (id) {
			this.init(id);
		}
	}

	ngOnDestroy(): void {
		for (let obs of this._obsers) {
			obs.unsubscribe();
		}
	}

	cancel() {
		this.viewControl.editMode = false;
	}

	save() {
		this.viewControl.editMode = false;
	}

	edit() {
		this.viewControl.editMode = true;
	}

	private init(id: string): void {
		Promise.all([
			this._tenantService.get(id)
		]).then(value => {
			this.viewData.tenant = value[0];
			this.viewModel.tenant = this.parseToViewModel(value[0]);

			this.bindBreadcrumbs();
			this.bindSubscribes();

			this.viewControl.loading$.next(false);
		}).catch(() => {
			this.viewControl.loading$.next(false);
		});
	}

	private parseToViewModel(tenant: TenantModel): TenantDetailViewModel {
		let vm = new TenantDetailViewModel();

		vm.CompanyName = tenant.CompanyName;
		vm.Address = tenant.CompanyAddress;
		vm.OwnerName = tenant.OwnerName;
		vm.Phone = tenant.CompanyPhone;
		vm.Status = tenant.Active ? Status.Active : Status.Deactive;
		vm.TaxCode = tenant.TaxCode;

		return vm;
	}

	private bindBreadcrumbs(): void {
		this._subheaderService.setBreadcrumbs([
			{ title: "TENANTS.LIST", page: '/tenants' },
			{ title: this.viewData.tenant.CompanyName, page: `/tenants/${this.viewData.tenant.Id}` }
		]);
	}

	private bindSubscribes() {
		this._obsers.push(
			this._translate.onLangChange.subscribe(() => {
				this.bindBreadcrumbs();
			})
		);
	}
}
