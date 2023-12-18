import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { CollectionModel, CollectionService, SystemAlertService, SubheaderService, LanguagePipe } from '../../../../../../core/core.module';

import { MenuService } from '../../services';
import { CollectionsDetailState } from '../../states';

@Component({
	selector: 'm-collections-resources',
	templateUrl: './collections-resources.page.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollectionsResourcesPage implements OnInit {

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

	lang: string = "vi";

	constructor(
		private _collectionService: CollectionService,
		private _systemAlertService: SystemAlertService,
		private _subheaderService: SubheaderService,
		private _menuService: MenuService,
		private _translate: TranslateService,
		private _collectionsDetailState: CollectionsDetailState
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

		model.Id = this.viewData.collection.Id;

		this.viewControl.loading$.next(true);

		let result = await this._collectionService.updateResources(model);

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

			this.setForm(JSON.parse(JSON.stringify(this.viewData.collection)));

			this.viewControl.loading$.next(false);
		}
	}

	private bindBreadcrumbs(): void {
		this._subheaderService.setBreadcrumbs([
			{ title: "COLLECTIONS.LIST", page: '/recommendation-embryos' },
			{ title: `${new LanguagePipe().transform(this.viewData.collection.Title)}`, page: `/recommendation-embryos/${this.viewData.collection.Id}` },
			{ title: "COLLECTIONS.RESOURCES", page: `/recommendation-embryos/${this.viewData.collection.Id}/resources` }
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

	private setForm(model: CollectionModel): void {
		this.form.get("Resources").setValue(model.Resources);
	}

	private parseForm(form: FormGroup): CollectionModel {
		let model = new CollectionModel();

		model.Resources = form.get("Resources").value;

		return model;
	}


	private generateForm(): FormGroup {
		return new FormGroup({
			Resources: new FormControl([], [<any>Validators.required])
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
