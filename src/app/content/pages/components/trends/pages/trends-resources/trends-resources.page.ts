import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import {
	TrendModel,

	TrendService,
	SystemAlertService,
	SubheaderService,

	LanguagePipe
} from '../../../../../../core/core.module';

import { MenuService } from '../../services';

import { TrendsDetailState } from '../../states';

@Component({
	selector: 'm-trends-resources',

	templateUrl: './trends-resources.page.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrendsResourcesPage implements OnInit {

	private _obsers: any[] = [];

	private _readyConditions: Map<string, boolean> = new Map([
		["Trend", false]
	]);

	form: FormGroup;

	viewControl: any = {
		loading$: new BehaviorSubject<boolean>(false),
		ready: false,
		submitting: false,
		editMode: false
	};

	viewData: any = {
		trend: new TrendModel()
	};

	constructor(
		private _trendService: TrendService,
		private _systemAlertService: SystemAlertService,
		private _subheaderService: SubheaderService,
		private _menuService: MenuService,
		private _translate: TranslateService,
		private _trendsDetailState: TrendsDetailState,
	) {
		this.form = this.generateForm();
	}

	ngOnInit(): void {
		this.viewControl.loading$.next(true);

		if (this._trendsDetailState.trend$.getValue()) {
			this.viewData.trend = this._trendsDetailState.trend$.getValue()

			this._readyConditions.set("Trend", true);

			this.init();
		}

		this.bindSubscribes();
	}

	ngOnDestroy(): void {
		for (let obs of this._obsers) {
			obs.unsubscribe();
		}
	}

	async save() {
		if (this.viewControl.submitting)
			return;

		this.viewControl.submitting = true;

		const controls = this.form.controls;

		if (this.form.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this._systemAlertService.error(this._translate.instant("COMMON.ERROR.FORM_INVALID"));

			this.viewControl.submitting = false;

			return;
		}

		let model = this.parseForm(this.form);

		model.Id = this.viewData.trend.Id;

		this.viewControl.loading$.next(true);

		let result = await this._trendService.updateResources(model);

		this.viewControl.loading$.next(false);
		this.viewControl.submitting = false;

		if (result) {
			this._systemAlertService.success(this._translate.instant("TRENDS.UPDATE_SUCCESSFUL"));

			this.viewControl.loading$.next(true);
			this.viewControl.ready = false;

			let newTrend = await this._trendService.get(this.viewData.trend.Id, true);
			this._trendsDetailState.trend$.next(newTrend);

			this.viewControl.loading$.next(false);
		}

		this.viewControl.editMode = false;
	}

	cancel(): void {
		this.setForm(JSON.parse(JSON.stringify(this.viewData.trend)));

		this.viewControl.editMode = false;
	}

	edit(): void {
		this.viewControl.editMode = true;
	}

	private init(): void {
		if (Array.from(this._readyConditions.values()).filter(x => x === false).length === 0) {
			if (this.viewControl.ready)
				return;

			this.viewControl.ready = true;

			this.bindBreadcrumbs();

			this._trendsDetailState.menu$.next(this._menuService.getTrendDetailMenu());

			this.setForm(JSON.parse(JSON.stringify(this.viewData.trend)));

			this.viewControl.loading$.next(false);
		}
	}

	private bindBreadcrumbs(): void {
		this._subheaderService.setBreadcrumbs([
			{ title: "TRENDS.LIST", page: '/trend-categories' },
			{ title: `${new LanguagePipe().transform(this.viewData.trend.Name)}`, page: `/trend-categories/${this.viewData.trend.Id}` },
			{ title: "TRENDS.RESOURCES", page: `/trend-categories/${this.viewData.trend.Id}/resources` }
		]);
	}

	private bindSubscribes(): void {
		this._obsers.push(
			this._trendsDetailState.trend$.subscribe(value => {
				if (value) {
					this.viewData.trend = value;

					this._readyConditions.set("Trend", true);

					this.init();
				}
			})
		);
	}

	private setForm(model: TrendModel): void {
		this.form.get("Resources").setValue(model.Resources);
	}

	private generateForm(): FormGroup {
		return new FormGroup({
			Resources: new FormControl([], [<any>Validators.required])
		});
	}

	private parseForm(form: FormGroup): TrendModel {
		let model = new TrendModel();

		model.Resources = form.get("Resources").value;

		return model;
	}
}
