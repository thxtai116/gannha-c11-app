import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import {
	RecommendationModel,

	SubheaderService,
	SystemAlertService,
	RecommendationService,
	LanguagePipe
} from '../../../../../../core/core.module';

import { RecommendationsDetailState } from '../../states';

import { MenuService } from '../../services';

@Component({
	selector: 'm-recommendations-resources',
	templateUrl: './recommendations-resources.page.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecommendationsResourcesPage implements OnInit {

	private _obsers: any[] = [];

	private _readyConditions: Map<string, boolean> = new Map([
		["Recommendation", false]
	]);

	form: FormGroup;

	viewControl: any = {
		loading$: new BehaviorSubject<boolean>(false),
		ready: false,
		submitting: false,
		editMode: false
	};

	viewData: any = {
		recommendation: new RecommendationModel()
	};

	constructor(
		private _recommendationService: RecommendationService,
		private _systemAlertService: SystemAlertService,
		private _subheaderService: SubheaderService,
		private _menuService: MenuService,
		private _translate: TranslateService,
		private _recommendationsDetailState: RecommendationsDetailState
	) {
		this.form = this.generateForm();
	}

	ngOnInit(): void {
		this.viewControl.loading$.next(true);

		if (this._recommendationsDetailState.recommendation$.getValue()) {
			this.viewData.recommendation = this._recommendationsDetailState.recommendation$.getValue()

			this._readyConditions.set("Recommendation", true);

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

		model.Id = this.viewData.recommendation.Id;

		this.viewControl.loading$.next(true);

		let result = await this._recommendationService.updateResource(model);

		this.viewControl.loading$.next(false);
		this.viewControl.submitting = false;

		if (result) {
			this._systemAlertService.success(this._translate.instant("RECOMMENDATIONS.UPDATE_SUCCESSFUL"));

			this.viewControl.loading$.next(true);

			this.reload();
		}

		this.viewControl.editMode = false;
	}

	cancel(): void {
		this.setForm(JSON.parse(JSON.stringify(this.viewData.recommendation)));

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

			this._recommendationsDetailState.menu$.next(this._menuService.getRecommendationDetailMenu());

			this.setForm(JSON.parse(JSON.stringify(this.viewData.recommendation)));

			this.viewControl.loading$.next(false);
		}
	}

	private bindBreadcrumbs(): void {
		this._subheaderService.setBreadcrumbs([
			{ title: "RECOMMENDATIONS.LIST", page: '/recommendation-configs' },
			{ title: `${new LanguagePipe().transform(this.viewData.recommendation.Name)}`, page: `/recommendation-configs/${this.viewData.recommendation.Id}` },
			{ title: "RECOMMENDATIONS.RESOURCES", page: `/recommendation-configs/${this.viewData.recommendation.Id}/resources` }
		]);
	}

	private bindSubscribes(): void {
		this._obsers.push(
			this._recommendationsDetailState.recommendation$.subscribe(value => {
				if (value) {
					this.viewData.recommendation = value;

					this._readyConditions.set("Recommendation", true);

					this.init();
				}
			})
		);

		this._obsers.push(
			this._translate.onLangChange.subscribe(() => {
				if (this._readyConditions.get("Recommendation")) {
					this.bindBreadcrumbs();
				}
			})
		);
	}

	private setForm(model: RecommendationModel): void {
		this.form.get("Resources").setValue(model.Resources);
		this.form.get("RecommendationType").setValue(model.RecommendationType.toString());
	}

	private parseForm(form: FormGroup): RecommendationModel {
		let model = new RecommendationModel();

		model.Resources = form.get('Resources').value.map(x => {
			return {
				Id: x.Id,
				Type: x.Type,
				Order: x.Order
			};
		});

		model.RecommendationType = form.get("RecommendationType").value;

		return model;
	}

	private generateForm(): FormGroup {
		return new FormGroup({
			Resources: new FormControl([], [<any>Validators.required]),
			RecommendationType: new FormControl('0', [<any>Validators.required]),
		});
	}

	private reload() {
		Promise.all([
			this._recommendationService.get(this.viewData.recommendation.Id)
		]).then(value => {
			this.viewControl.ready = false;

			this._recommendationsDetailState.recommendation$.next(value[0]);
		}).catch(() => {
			this.viewControl.loading$.next(false);
		})
	}
}
