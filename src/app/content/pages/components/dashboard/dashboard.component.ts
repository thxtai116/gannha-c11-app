import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import { SubheaderService } from '../../../../core/core.module';

@Component({
	selector: 'm-dashboard',
	templateUrl: './dashboard.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {

	public config: any;

	constructor(
		private _subheaderService: SubheaderService,
	) {
	}

	ngOnInit(): void {
		this.bindBreadcrumbs();
	}

	private bindBreadcrumbs(): void {
		this._subheaderService.setBreadcrumbs([
			{ title: "DASHBOARD", page: '/dashboard' }
		]);
	}
}
