import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';

import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

import {
	CollectionModel,
	ScheduleRepeatEveryModel,

	CollectionService,
	SystemAlertService,
	SubheaderService,
	ConfirmService,

	ScheduleUtility,

	LanguagePipe,
	MaxWords
} from '../../../../../../core/core.module';

import { CollectionBasicInfoViewModel } from '../../view-models';
import { MenuService } from '../../services';
import { CollectionsDetailState } from '../../states';

@Component({
	selector: 'm-collections-basic-info',
	templateUrl: './collections-basic-info.page.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollectionsBasicInfoPage implements OnInit {

	private _obsers: any[] = [];

	private _readyConditions: Map<string, boolean> = new Map([
		["Collection", false]
	]);

	form: FormGroup;

	viewControl: any = {
		loading$: new BehaviorSubject<boolean>(false),
		ready: false,
		submitting: false,
		editMode: false
	};

	viewData: any = {
		collection: new CollectionModel()
	};

	viewModel: any = {
		collection: new CollectionBasicInfoViewModel()
	}

	lang: string = "vi";

	constructor(
		private _collectionService: CollectionService,
		private _systemAlertService: SystemAlertService,
		private _subheaderService: SubheaderService,
		private _menuService: MenuService,
		private _translate: TranslateService,
		private _confirmService: ConfirmService,
		private _collectionsDetailState: CollectionsDetailState,
		private _scheduleUtil: ScheduleUtility
	) {
		this.form = this.generateForm();
	}

	ngOnInit(): void {
		this.viewControl.loading$.next(true);

		if (this._collectionsDetailState.collection$.getValue()) {
			this.viewData.collection = this._collectionsDetailState.collection$.getValue()

			this._readyConditions.set("Collection", true);

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
		const dialogRef = this._confirmService.show(this._translate.instant('COMMON.CONFIRMATION'), this._translate.instant('COLLECTIONS.ACTIVATE_COMFIRM'));

		let sub = dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.viewControl.loading$.next(true);

			Promise.all([
				this._collectionService.activate(this.viewData.collection.Id)
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
		const dialogRef = this._confirmService.show(this._translate.instant('COMMON.CONFIRMATION'), this._translate.instant('COLLECTIONS.DEACTIVATE_COMFIRM'));

		let sub = dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.viewControl.loading$.next(true);

			Promise.all([
				this._collectionService.deactivate(this.viewData.collection.Id)
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
			Object.keys(controls).forEach(controlName => {
				controls[controlName].markAsTouched();
				controls[controlName].markAsDirty();
			});

			this._systemAlertService.error(this._translate.instant("COMMON.ERROR.FORM_INVALID"));

			this.viewControl.submitting = false;

			return;
		}

		let model = this.parseForm(this.form);

		model.Id = this.viewData.collection.Id;

		this.viewControl.loading$.next(true);

		let result = await this._collectionService.updateBasicInfo(model);

		this.viewControl.loading$.next(false);
		this.viewControl.submitting = false;

		if (result) {
			this._systemAlertService.success(this._translate.instant("COLLECTIONS.UPDATE_SUCCESSFUL"));

			this.viewControl.loading$.next(true);
			this.reload();
		}


		this.viewControl.editMode = false;
	}

	cancel(): void {
		this.setForm(JSON.parse(JSON.stringify(this.viewData.collection)));

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

			this._collectionsDetailState.menu$.next(this._menuService.getCollectionsDetailMenu());

			this.viewModel.collection = this.parseToViewModel(this.viewData.collection);

			this.setForm(JSON.parse(JSON.stringify(this.viewData.collection)));

			this.viewControl.loading$.next(false);
		}
	}

	private bindBreadcrumbs(): void {
		this._subheaderService.setBreadcrumbs([
			{ title: "COLLECTIONS.LIST", page: '/recommendation-embryos' },
			{ title: `${new LanguagePipe().transform(this.viewData.collection.Title)}`, page: `/recommendation-embryos/${this.viewData.collection.Id}` },
			{ title: "COLLECTIONS.BASIC_INFO", page: `/recommendation-embryos/${this.viewData.collection.Id}/basic-info` }
		]);
	}

	private bindSubscribes(): void {
		this._obsers.push(
			this._collectionsDetailState.collection$.subscribe(value => {
				if (value) {
					this.viewData.collection = value;

					this._readyConditions.set("Collection", true);

					this.init();
				}
			})
		);

		this._obsers.push(
			this._translate.onLangChange.subscribe(() => {
				if (this._readyConditions.get("Collection")) {
					this.bindBreadcrumbs();
				}
			})
		);
	}

	private parseToViewModel(model: CollectionModel): CollectionBasicInfoViewModel {
		let vm = new CollectionBasicInfoViewModel();

		vm.Title = new LanguagePipe().transform(model.Title);
		vm.TitleEn = new LanguagePipe().transform(model.Title, "en");
		vm.Description = new LanguagePipe().transform(model.Description);
		vm.DescriptionEn = new LanguagePipe().transform(model.Description, "en");

		vm.StartDate = new Date(model.StartDate);
		vm.EndDate = new Date(model.EndDate);
		vm.TimeRanges = model.TimeRanges;

		vm.Status = model.Status;
		vm.CreatedAt = new Date(model.CreatedAt);

		vm.Repeat = this._scheduleUtil.toString(model.Repeat);

		return vm;
	}

	private setForm(model: CollectionModel): void {
		this.form.get("Title").setValue(new LanguagePipe().transform(model.Title));
		this.form.get("TitleEn").setValue(new LanguagePipe().transform(model.Title, "en"));
		this.form.get("Description").setValue(new LanguagePipe().transform(model.Description));
		this.form.get("DescriptionEn").setValue(new LanguagePipe().transform(model.Description, "en"));
		this.form.get("DateRanges").setValue([new Date(model.StartDate), new Date(model.EndDate)]);
		this.form.get("TimeRanges").setValue(model.TimeRanges);
		this.form.get("Repeat").setValue(model.Repeat);
		this.form.get("Gallery").setValue(model.Gallery);
	}

	private parseForm(form: FormGroup): CollectionModel {
		let model = new CollectionModel();

		model.Title[this.lang] = form.get('Title').value;
		model.Title["en"] = form.get('TitleEn').value;
		model.Description[this.lang] = form.get('Description').value;
		model.Description["en"] = form.get('DescriptionEn').value;

		model.StartDate = form.get('DateRanges').value[0];
		model.EndDate = form.get('DateRanges').value[1];

		model.TimeRanges = form.get('TimeRanges').value;

		model.Repeat = form.get("Repeat").value;
		model.Gallery = form.get("Gallery").value;

		return model;
	}

	private generateForm(): FormGroup {
		return new FormGroup({
			DateRanges: new FormControl([new Date(), new Date()]),
			TimeRanges: new FormControl([], [<any>Validators.required]),
			Title: new FormControl('', [<any>Validators.required, <any>MaxWords.validate(17)]),
			TitleEn: new FormControl('', [<any>MaxWords.validate(17)]),
			Description: new FormControl('', [<any>Validators.required, <any>MaxWords.validate(70)]),
			DescriptionEn: new FormControl('', [<any>MaxWords.validate(70)]),

			Repeat: new FormControl(new ScheduleRepeatEveryModel()),
			Gallery: new FormControl([], [<any>Validators.required])
		});
	}

	private reload() {
		Promise.all([
			this._collectionService.get(this.viewData.collection.Id)
		]).then(value => {
			this.viewControl.ready = false;

			this._collectionsDetailState.collection$.next(value[0]);
		}).catch(() => {
			this.viewControl.loading$.next(false);
		})
	}
}
