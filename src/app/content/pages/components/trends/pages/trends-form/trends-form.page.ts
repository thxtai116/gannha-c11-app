import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import {
	SubheaderService,
	SystemAlertService,

	ScheduleRepeatEveryModel,
	TrendModel,
	TrendService
} from '../../../../../../core/core.module';

@Component({
	selector: 'm-trends-form',
	templateUrl: './trends-form.page.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrendsFormPage implements OnInit {

	private _obsers: any[] = [];

	lang: string = "vi";

	viewControl: any = {
		ready: false,
		submitting: false,
		loading$: new BehaviorSubject<boolean>(false)
	};

	form: FormGroup;

	constructor(
		private _router: Router,
		private _trendService: TrendService,
		private _subheaderService: SubheaderService,
		private _systemAlertService: SystemAlertService,
		private _translate: TranslateService,
	) {
		this.form = this.generateForm();
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

		this.viewControl.loading$.next(true);

		let result = await this._trendService.create(model);

		this.viewControl.loading$.next(false);
		this.viewControl.submitting = false;

		if (result) {
			this._systemAlertService.success(this._translate.instant("TRENDS.CREATE_SUCCESSFUL"));

			this._router.navigate(["/trend-categories", result.Id]);
		}
	}

	private bindBreadcrumbs(): void {
		this._subheaderService.setBreadcrumbs([
			{ title: "TRENDS.LIST", page: '/trend-categories' },
			{ title: "TRENDS.NEW_TREND", page: `/trend-categories/create` }
		]);
	}

	private bindSubscribes() {
		this._obsers.push(
			this._translate.onLangChange.subscribe(() => {
				this.bindBreadcrumbs();
			})
		);
	}

	private parseForm(form: FormGroup): TrendModel {
		let model = new TrendModel();

		model.Name[this.lang] = form.get('Name').value;

		model.StartDate = form.get('DateRanges').value[0];
		model.EndDate = form.get('DateRanges').value[1];

		model.Order = form.get('Order').value;
		model.TimeRanges = form.get('TimeRanges').value;
		model.Resources = form.get('Resources').value.map(x => {
			return {
				Id: x.Id,
				Type: x.Type,
				Order: x.Order
			};
		});

		model.Repeat = form.get("Repeat").value;

		return model;
	}

	private generateForm(): FormGroup {
		return new FormGroup({
			DateRanges: new FormControl([new Date(), new Date()]),
			TimeRanges: new FormControl([], [<any>Validators.required]),
			Order: new FormControl(1),
			Name: new FormControl('', [<any>Validators.required]),
			Resources: new FormControl([], [<any>Validators.required]),
			Repeat: new FormControl(new ScheduleRepeatEveryModel())
		});
	}
}
