import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

import {
	TrendModel,

	TrendService,
	SystemAlertService,
	SubheaderService,

	LanguagePipe,

	ScheduleUtility,
	ScheduleRepeatEveryModel,
	ConfirmService
} from '../../../../../../core/core.module';

import { TrendsDetailState } from '../../states';
import { MenuService } from '../../services';
import { TrendBasicInfoViewModel } from '../../view-models';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'm-trends-basic-info',
	templateUrl: './trends-basic-info.page.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrendsBasicInfoPage implements OnInit {

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

	viewModel: any = {
		trend: new TrendBasicInfoViewModel()
	}

	lang: string = "vi";

	constructor(
		private _trendService: TrendService,
		private _systemAlertService: SystemAlertService,
		private _subheaderService: SubheaderService,
		private _menuService: MenuService,
		private _translate: TranslateService,
		private _confirmService: ConfirmService,
		private _trendsDetailState: TrendsDetailState,
		private _scheduleUtil: ScheduleUtility
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

		let result = await this._trendService.updateBasicInfo(model);

		this.viewControl.loading$.next(false);
		this.viewControl.submitting = false;

		if (result) {
			this._systemAlertService.success(this._translate.instant("TRENDS.UPDATE_SUCCESSFUL"));

			this.viewControl.ready = false;

			this.reload();
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

	activate(): void {
		const dialogRef = this._confirmService.show(this._translate.instant('COMMON.CONFIRMATION'), this._translate.instant('TRENDS.CRUD_MESSAGE.ACTIVATE_CONFIRM'));

		let sub = dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.viewControl.loading$.next(true);

			this._trendService.activate(this.viewData.trend.Id).then(res => {
				if (res) {
					this._systemAlertService.success(this._translate.instant('TRENDS.CRUD_MESSAGE.ACTIVATE_SUCCESSFUL'));

					this.viewControl.ready = false;

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
		const dialogRef = this._confirmService.show(this._translate.instant('COMMON.CONFIRMATION'), this._translate.instant('TRENDS.CRUD_MESSAGE.DEACTIVATE_CONFIRM'));

		let sub = dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.viewControl.loading$.next(true);

			this._trendService.deactivate(this.viewData.trend.Id).then(res => {
				if (res) {
					this._systemAlertService.success(this._translate.instant('TRENDS.CRUD_MESSAGE.DEACTIVATE_SUCCESSFUL'));

					this.viewControl.ready = false;

					this.reload();
				} else {
					this.viewControl.loading$.next(false);
				}
			}).catch(() => {
				this.viewControl.loading$.next(false);
			}).finally(() => sub.unsubscribe());
		});
	}

	private async reload() {
		this.viewControl.loading$.next(true);

		let newTrend = await this._trendService.get(this.viewData.trend.Id, true);
		this._trendsDetailState.trend$.next(newTrend);

		this.viewControl.loading$.next(false);
	}

	private init(): void {
		if (Array.from(this._readyConditions.values()).filter(x => x === false).length === 0) {
			if (this.viewControl.ready)
				return;

			this.viewControl.ready = true;

			this.bindBreadcrumbs();

			this._trendsDetailState.menu$.next(this._menuService.getTrendDetailMenu());

			this.viewModel.trend = this.parseToViewModel(this.viewData.trend);

			this.setForm(JSON.parse(JSON.stringify(this.viewData.trend)));

			this.viewControl.loading$.next(false);
		}
	}

	private bindBreadcrumbs(): void {
		this._subheaderService.setBreadcrumbs([
			{ title: "TRENDS.LIST", page: '/trend-categories' },
			{ title: `${new LanguagePipe().transform(this.viewData.trend.Name)}`, page: `/trend-categories/${this.viewData.trend.Id}` },
			{ title: "TRENDS.BASIC_INFO", page: `/trend-categories/${this.viewData.trend.Id}/basic-info` }
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
		this.form.get("Name").setValue(new LanguagePipe().transform(model.Name));
		this.form.get("Order").setValue(model.Order);
		this.form.get("DateRanges").setValue([new Date(model.StartDate), new Date(model.EndDate)]);
		this.form.get("TimeRanges").setValue(model.TimeRanges);
		this.form.get("Repeat").setValue(model.Repeat);
	}

	private generateForm(): FormGroup {
		return new FormGroup({
			DateRanges: new FormControl([new Date(), new Date()]),
			TimeRanges: new FormControl([], [<any>Validators.required]),
			Order: new FormControl(0),
			Name: new FormControl('', [<any>Validators.required]),
			Repeat: new FormControl(new ScheduleRepeatEveryModel())
		});
	}

	private parseToViewModel(model: TrendModel): TrendBasicInfoViewModel {
		let vm = new TrendBasicInfoViewModel();

		vm.Name = new LanguagePipe().transform(model.Name);
		vm.Order = model.Order;

		vm.StartDate = new Date(model.StartDate);
		vm.EndDate = new Date(model.EndDate);
		vm.TimeRanges = model.TimeRanges;

		vm.Status = model.Status;
		vm.CreatedAt = new Date(model.CreatedAt);

		vm.Repeat = this._scheduleUtil.toString(model.Repeat);

		return vm;
	}

	private parseForm(form: FormGroup): TrendModel {
		let model = new TrendModel();

		model.Name[this.lang] = form.get('Name').value;

		model.StartDate = form.get('DateRanges').value[0];
		model.EndDate = form.get('DateRanges').value[1];

		model.Order = form.get('Order').value;
		model.TimeRanges = form.get('TimeRanges').value;
		model.Repeat = form.get("Repeat").value;

		return model;
	}
}
