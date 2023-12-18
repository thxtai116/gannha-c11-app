import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

import { TranslateService } from '@ngx-translate/core';

import {
	RecommendationModel,
	ScheduleRepeatEveryModel,

	RecommendationService,
	SystemAlertService,
	SubheaderService,

	ScheduleUtility,
	LanguagePipe,
	ConfirmService
} from '../../../../../../core/core.module';

import { RecommendationBasicInfoViewModel } from '../../view-models';
import { RecommendationsDetailState } from '../../states';
import { MenuService } from '../../services';

@Component({
	selector: 'm-recommendations-basic-info',
	templateUrl: './recommendations-basic-info.page.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecommendationsBasicInfoPage implements OnInit {

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

	viewModel: any = {
		recommendation: new RecommendationBasicInfoViewModel()
	}

	lang: string = "vi";

	constructor(
		private _recommendationService: RecommendationService,
		private _systemAlertService: SystemAlertService,
		private _subheaderService: SubheaderService,
		private _menuService: MenuService,
		private _translate: TranslateService,
		private _confirmService: ConfirmService,
		private _recommendationsDetailState: RecommendationsDetailState,
		private _scheduleUtil: ScheduleUtility
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

	activate(): void {
		const dialogRef = this._confirmService.show(this._translate.instant('COMMON.CONFIRMATION'), this._translate.instant('RECOMMENDATIONS.ACTIVATE_COMFIRM'));

		let sub = dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.viewControl.loading$.next(true);

			Promise.all([
				this._recommendationService.activate(this.viewData.recommendation.Id)
			]).then(value => {
				if (value[0]) {
					this._systemAlertService.success(this._translate.instant('COMMON.ACTIVATE_SUCCESS'));

					this.reload();
				} else {
					this.viewControl.loading$.next(false);
				}
			}).catch(() => {
				this.viewControl.loading$.next(false);
			}).finally(() => sub.unsubscribe());
		});
	}

	deactivate(): void {
		const dialogRef = this._confirmService.show(this._translate.instant('COMMON.CONFIRMATION'), this._translate.instant('RECOMMENDATIONS.DEACTIVATE_COMFIRM'));

		let sub = dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.viewControl.loading$.next(true);

			Promise.all([
				this._recommendationService.deactivate(this.viewData.recommendation.Id)
			]).then(value => {
				if (value[0]) {
					this._systemAlertService.success(this._translate.instant('COMMON.DEACTIVATE_SUCCESS'));

					this.reload();
				} else {
					this.viewControl.loading$.next(false);
				}
			}).catch(() => {
				this.viewControl.loading$.next(false);
			}).finally(() => sub.unsubscribe());
		});
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

		let result = await this._recommendationService.updateBasicInfo(model);

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

			this.viewModel.recommendation = this.parseToViewModel(this.viewData.recommendation);

			this.setForm(JSON.parse(JSON.stringify(this.viewData.recommendation)));

			this.viewControl.loading$.next(false);
		}
	}

	private bindBreadcrumbs(): void {
		this._subheaderService.setBreadcrumbs([
			{ title: "RECOMMENDATIONS.LIST", page: '/recommendation-configs' },
			{ title: `${new LanguagePipe().transform(this.viewData.recommendation.Name)}`, page: `/recommendation-configs/${this.viewData.recommendation.Id}` },
			{ title: "RECOMMENDATIONS.BASIC_INFO", page: `/recommendation-configs/${this.viewData.recommendation.Id}/basic-info` }
		]);
	}

	private parseToViewModel(model: RecommendationModel): RecommendationBasicInfoViewModel {
		let vm = new RecommendationBasicInfoViewModel();

		vm.Name = new LanguagePipe().transform(model.Name);
		vm.Title = new LanguagePipe().transform(model.Title);
		vm.TitleEn = new LanguagePipe().transform(model.Title, "en");

		vm.Order = model.Order;

		vm.StartDate = new Date(model.StartDate);
		vm.EndDate = new Date(model.EndDate);
		vm.TimeRanges = model.TimeRanges;

		vm.Status = model.Status;
		vm.CreatedAt = new Date(model.CreatedAt);

		vm.Repeat = this._scheduleUtil.toString(model.Repeat);
		vm.Icon = model.Icon;

		return vm;
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
		this.form.get("Name").setValue(new LanguagePipe().transform(model.Name));
		this.form.get("Title").setValue(new LanguagePipe().transform(model.Title));
		this.form.get("TitleEn").setValue(new LanguagePipe().transform(model.Title, "en"));
		this.form.get("Order").setValue(model.Order);
		this.form.get("DateRanges").setValue([new Date(model.StartDate), new Date(model.EndDate)]);
		this.form.get("TimeRanges").setValue(model.TimeRanges);
		this.form.get("Repeat").setValue(model.Repeat);
		this.form.get("Icon").setValue(model.Icon);
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

		model.Repeat = form.get("Repeat").value;
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
			Icon: new FormControl(""),
			Repeat: new FormControl(new ScheduleRepeatEveryModel())
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
