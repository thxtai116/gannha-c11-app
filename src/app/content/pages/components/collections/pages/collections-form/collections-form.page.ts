import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms'; import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

import {
	ScheduleRepeatEveryModel,
	CollectionModel,

	CollectionService,
	SubheaderService,
	SystemAlertService,
	MaxWords,
	UuidUtility,
	StorageUtility,
	LocalStorageKey,
} from '../../../../../../core/core.module';


@Component({
	selector: 'm-collections-form',
	templateUrl: 'collections-form.page.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollectionsFormPage implements OnInit, OnDestroy {

	private _obsers: any[] = [];

	lang: string = "vi";

	viewControl: any = {
		ready: false,
		submitting: false,
		loading$: new BehaviorSubject<boolean>(false)
	};

	viewData: any = {
		draftId: "",
	}

	form: FormGroup;

	constructor(
		private _router: Router,
		private _collectionService: CollectionService,
		private _subheaderService: SubheaderService,
		private _systemAlertService: SystemAlertService,
		private _translate: TranslateService,
		private _route: ActivatedRoute,
		private _storageUtil: StorageUtility,
		private _uuidUtility: UuidUtility,
	) {
		this.form = this.generateForm();
	}

	ngOnInit(): void {
		this.init();
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
			Object.keys(controls).forEach(controlName => {
				controls[controlName].markAsTouched();
				controls[controlName].markAsDirty();
			});

			this._systemAlertService.error(this._translate.instant("COMMON.ERROR.FORM_INVALID"));

			this.viewControl.submitting = false;

			return;
		}

		let model = this.parseForm(this.form);

		this.viewControl.loading$.next(true);

		let result = await this._collectionService.create(model);

		this.viewControl.loading$.next(false);
		this.viewControl.submitting = false;

		if (result) {
			this.deleteDraft(this.viewData.draftId);
			this._systemAlertService.success(this._translate.instant("COLLECTIONS.CREATE_SUCCESSFUL"));

			this._router.navigate(["/recommendation-embryos", result.Id]);
		}
	}

	private init(): void {
		let _id = this._route.snapshot.params["id"];

		if (_id && _id.length > 0) {
			this.viewData.draftId = _id;
			this.bindBreadcrumbs(this.viewData.draftId);

			let currentList: CollectionModel[] = JSON.parse(this._storageUtil.get(LocalStorageKey.draftCollections));

			let draft = currentList.find(x => x.Id == this.viewData.draftId);

			this.parseToForm(draft);
		} else {
			this.bindBreadcrumbs();
			this.viewData.draftId = this._uuidUtility.UUID();
		}
	}

	private bindBreadcrumbs(draftId?: string): void {
		if (draftId && draftId.length > 0) {
			this._subheaderService.setBreadcrumbs([
				{ title: "COLLECTIONS.LIST", page: '/recommendation-embryos' },
				{ title: "COLLECTIONS.NEW_COLLECTION", page: `/recommendation-embryos/create/${draftId}` }
			]);
		} else {
			this._subheaderService.setBreadcrumbs([
				{ title: "COLLECTIONS.LIST", page: '/recommendation-embryos' },
				{ title: "COLLECTIONS.NEW_COLLECTION", page: `/recommendation-embryos/create` }
			]);
		}
	}

	private bindSubscribes() {
		this._obsers.push(
			this.form.valueChanges.subscribe(() => {
				this.saveDraft(this.form);
			})
		)

		this._obsers.push(
			this._translate.onLangChange.subscribe(() => {
				this.bindBreadcrumbs(this.viewData.draftId);
			})
		);
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
		model.Resources = form.get('Resources').value.map(x => {
			return {
				Id: x.Id,
				Type: x.Type,
				Order: x.Order
			};
		});

		model.Repeat = form.get("Repeat").value;

		model.Gallery = form.get("Gallery").value;

		return model;
	}

	private parseToForm(collection: CollectionModel) {
		this.form.get('DateRanges').setValue([new Date(collection.StartDate), new Date(collection.EndDate)]);
		this.form.get('TimeRanges').setValue(collection.TimeRanges || []);
		this.form.get('Title').setValue(collection.Title.vi || "");
		this.form.get('TitleEn').setValue(collection.Title.en || "");
		this.form.get('Description').setValue(collection.Description.vi || "");
		this.form.get('DescriptionEn').setValue(collection.Description.en || "");
		this.form.get('Resources').setValue(collection.Resources || []);
		this.form.get('Repeat').setValue(collection.Repeat || new ScheduleRepeatEveryModel());
		this.form.get('Gallery').setValue(collection.Gallery || []);
	}

	private generateForm(): FormGroup {
		return new FormGroup({
			DateRanges: new FormControl([new Date(), new Date()]),
			TimeRanges: new FormControl([], [<any>Validators.required]),
			Title: new FormControl('', [<any>Validators.required, <any>MaxWords.validate(17)]),
			TitleEn: new FormControl('', [<any>MaxWords.validate(17)]),
			Description: new FormControl('', [<any>Validators.required, <any>MaxWords.validate(70)]),
			DescriptionEn: new FormControl('', [<any>MaxWords.validate(70)]),
			Resources: new FormControl([], [<any>Validators.required]),
			Repeat: new FormControl(new ScheduleRepeatEveryModel()),
			Gallery: new FormControl([], [<any>Validators.required])
		});
	}

	private saveDraft(form: FormGroup) {
		let currentList: CollectionModel[] = JSON.parse(this._storageUtil.get(LocalStorageKey.draftCollections));
		let model = this.parseForm(form);
		model.Id = this.viewData.draftId;
		if (!currentList) {
			currentList = [model];
		} else {
			var oldItem = currentList.find(x => x.Id == model.Id);

			if (!oldItem) {
				currentList.push(model);
			} else {
				let index = currentList.findIndex(x => x.Id == oldItem.Id);
				currentList[index] = model;
			}
		}
		this._storageUtil.set(LocalStorageKey.draftCollections, JSON.stringify(currentList));
	}

	private deleteDraft(id: string) {
		let currentList: CollectionModel[] = JSON.parse(this._storageUtil.get(LocalStorageKey.draftCollections));

		if (currentList) {
			let index = currentList.findIndex(x => x.Id == id);
			currentList.splice(index, 1);
			this._storageUtil.set(LocalStorageKey.draftCollections, JSON.stringify(currentList));
		}
	}
}
