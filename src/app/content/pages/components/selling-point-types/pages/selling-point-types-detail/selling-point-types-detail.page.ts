import { ChangeDetectionStrategy, Component, Renderer, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import {
    SellingPointTypeModel,

    SubheaderService,
    SystemAlertService,
    SellingPointTypeService,
    IconService,

    MinArray,
    LanguagePipe,
} from '../../../../../../core/core.module';

import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'm-selling-point-types-detail',
    templateUrl: './selling-point-types-detail.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SellingPointTypesDetailPage {
    @ViewChild("fileInputMulti", { static: true }) fileInputMulti: ElementRef;

    private _obsers: any[] = [];

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false),
        editMode: false,
        submitting: false,
    }

    viewForm: any = {
        formGroup: FormGroup,
    }

    viewModel: any = {
        spType: new SellingPointTypeModel,
    }

    constructor(
        private _renderer: Renderer,
        private _route: ActivatedRoute,
        private _spTypeService: SellingPointTypeService,
        private _iconService: IconService,
        private _subheaderService: SubheaderService,
        private _systemAlertService: SystemAlertService,
        private _translate: TranslateService
    ) {
        this.viewForm.formGroup = this.generateCreateForm();
    }

    ngOnInit(): void {
        this.viewControl.loading$.next(true);

        this.init();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers)
            obs.unsubscribe();
    }

    edit() {
        this.viewControl.editMode = true;
    }

    uploadIcon() {
        let event = new MouseEvent('click', { bubbles: true });

        this._renderer.invokeElementMethod(this.fileInputMulti.nativeElement, "dispatchEvent", [event]);
    }

    cancel() {
        this.parseModelToForm(this.viewModel.spType);

        this.viewControl.editMode = false;
    }

    async save() {
        if (this.viewControl.submitting) return;

        if (!this.viewForm.formGroup.valid) {
            this._systemAlertService.error(this._translate.instant("COMMON.ERROR.FORM_INVALID"));
            return;
        }

        let spT = this.parseFormToModel(this.viewForm.formGroup);

        this.viewControl.submitting = true;

        this.viewControl.loading$.next(true);

        let result = await this._spTypeService.update(spT);

        if (result) {
            this._systemAlertService.success(this._translate.instant("SELLING_POINT_TYPES.UPDATE_SUCCESSFUL"));
            this._spTypeService.reset();

            await this.init();
        }

        this.viewControl.loading$.next(false);

        this.viewControl.submitting = false;

        this.viewControl.editMode = false;
    }

    private init() {
        let id = this._route.snapshot.params["id"];

        if (id) {
            Promise.all([
                this._spTypeService.get(id)
            ]).then(value => {
                this.viewModel.spType = value[0]

                this.bindBreadcrumbs();

                this.parseModelToForm(this.viewModel.spType);

                this.viewControl.loading$.next(false);
            }).catch(() => {
                this.viewControl.loading$.next(false);
            });
        }
    }

    async fileChange(event) {
        let files = event.target.files;
        if (files) {
            this.viewControl.loading$.next(true);

            for (let i = 0; i < files.length; i++) {
                let file = files[i];

                let formData: FormData = new FormData();

                formData.append('file', file, file.name);

                let result = await this._iconService.submit(formData);

                if (result) {
                    this._systemAlertService.success(this._translate.instant("ICONS.UPLOAD_SUCCESSFUL"));

                    this.viewForm.formGroup.get("Icons").setValue([file.name.substring(0, file.name.lastIndexOf('.'))]);
                }
            }

            this.fileInputMulti.nativeElement.value = "";

            this.viewControl.loading$.next(false);
        }
    }

    private parseModelToForm(spT: SellingPointTypeModel) {
        let model = JSON.parse(JSON.stringify(spT));

        this.viewForm.formGroup.get('ViName').setValue(new LanguagePipe().transform(model.Name));
        this.viewForm.formGroup.get('EnName').setValue(new LanguagePipe().transform(model.Name, "en"));
        this.viewForm.formGroup.get('Description').setValue(new LanguagePipe().transform(model.Description));
        this.viewForm.formGroup.get('Color').setValue(model.Color);
        this.viewForm.formGroup.get('Icons').setValue(model.Icon);
    }

    private parseFormToModel(form: FormGroup): SellingPointTypeModel {
        let spT: SellingPointTypeModel = new SellingPointTypeModel();

        spT.Id = this.viewModel.spType.Id;
        spT.Name["vi"] = form.get("ViName").value;
        spT.Name["en"] = form.get("EnName").value;
        spT.Description["vi"] = form.get("Description").value;
        spT.Color = form.get("Color").value;
        spT.Icon = form.get("Icons").value;

        return spT;
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "SELLING_POINT_TYPES.LIST", page: '/selling-point-types' },
            { title: "SELLING_POINT_TYPES.DETAIL", page: '/selling-point-types/:id' }
        ]);
    }

    private generateCreateForm(): FormGroup {
        return new FormGroup({
            ViName: new FormControl('', [Validators.required]),
            EnName: new FormControl('', [Validators.required]),
            Description: new FormControl('', [Validators.required]),
            Color: new FormControl('', [Validators.required]),
            Icons: new FormControl('', [MinArray.validate(1)]),
        })
    }
}