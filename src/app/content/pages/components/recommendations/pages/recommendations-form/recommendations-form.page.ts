import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';

import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import {
	ScheduleRepeatEveryModel,
	RecommendationModel,

	RecommendationService,
	SubheaderService,
	SystemAlertService
} from '../../../../../../core/core.module';

@Component({
	selector: 'm-recommendations-form',
	templateUrl: './recommendations-form.page.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecommendationsFormPage implements OnInit {

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
		private _recommendationService: RecommendationService,
		private _subheaderService: SubheaderService,
		private _systemAlertService: SystemAlertService,
		private _translate: TranslateService,
	) {
		this.form = this.generateForm();
	}

	ngOnInit(): void {
		this.bindBreadcrumbs();
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

		let result = await this._recommendationService.create(model);

		this.viewControl.loading$.next(false);
		this.viewControl.submitting = false;

		if (result) {
			this._systemAlertService.success(this._translate.instant("RECOMMENDATIONS.CREATE_SUCCESSFUL"));

			this._router.navigate(["/recommendation-configs", result.Id]);
		}
	}

	private bindBreadcrumbs(): void {
		this._subheaderService.setBreadcrumbs([
			{ title: this._translate.instant("RECOMMENDATIONS.LIST"), page: '/recommendation-configs' },
			{ title: this._translate.instant("RECOMMENDATIONS.NEW_RECOMMENDATION"), page: `/recommendation-configs/create` }
		]);
	}

	private parseForm(form: FormGroup): RecommendationModel {
		let model = new RecommendationModel();

		model.Name[this.lang] = form.get('Name').value;
		model.Title[this.lang] = form.get('Title').value;
		model.Title["en"] = form.get('TitleEn').value;

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
		model.RecommendationType = form.get("RecommendationType").value;
		model.Icon = form.get("Icon").value;

		return model;
	}

	private generateForm(): FormGroup {
		return new FormGroup({
			DateRanges: new FormControl([new Date(), new Date()]),
			TimeRanges: new FormControl([], [<any>Validators.required]),
			Order: new FormControl(1),
			Name: new FormControl('', [<any>Validators.required]),
			Title: new FormControl('', [<any>Validators.required]),
			TitleEn: new FormControl(''),
			Resources: new FormControl([], [<any>Validators.required]),
			Icon: new FormControl(""),
			RecommendationType: new FormControl('0', [<any>Validators.required]),
			Repeat: new FormControl(new ScheduleRepeatEveryModel())
		});
	}
}
