import { ChangeDetectionStrategy, Component, Renderer, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

import {
    SellingPointTypeModel,

    SubheaderService,
    SystemAlertService,
    SellingPointTypeService,

    MinArray,
    IconService,
} from '../../../../../../core/core.module';

@Component({
    selector: 'm-selling-point-types-form',
    templateUrl: './selling-point-types-form.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SellingPointTypesFormPage {
    @ViewChild("fileInputMulti", { static: true }) fileInputMulti: ElementRef;

    private _obsers: any[] = [];

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false),
    }

    viewForm: any = {
        formGroup: FormGroup,
    }

    viewData: any = {
        form: new SellingPointTypeModel,
    }

    constructor(
        private _subheaderService: SubheaderService,
        private _spTypeService: SellingPointTypeService,
        private _iconService: IconService,
        private _systemAlertService: SystemAlertService,
        private _translate: TranslateService,
        private _renderer: Renderer,
    ) {
        this.viewForm.formGroup = this.generateForm();
    }

    ngOnInit(): void {
        this.bindBreadcrumbs();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    uploadIcon() {
        let event = new MouseEvent('click', { bubbles: true });

        this._renderer.invokeElementMethod(this.fileInputMulti.nativeElement, "dispatchEvent", [event]);
    }

    save() {
        const controls = this.viewForm.formGroup.controls;

        if (this.viewForm.formGroup.invalid) {
            Object.keys(controls).forEach(controlName =>
                controls[controlName].markAsTouched()
            );

            this._systemAlertService.error(this._translate.instant("COMMON.ERROR.FORM_INVALID"));
            return;
        }

        this.parseSpTypeForm(this.viewForm.formGroup);
        this.createSpType();
    }

    async createSpType() {
        this.viewControl.loading$.next(true);

        let data = await this._spTypeService.create(this.viewData.form);

        this.viewControl.loading$.next(false);

        if (data) {
            this._systemAlertService.success(this._translate.instant("SELLING_POINT_TYPES.CREATE_SUCCESSFUL"));
            this._spTypeService.reset();
            this.viewForm.formGroup.reset();
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

    private parseSpTypeForm(formGroup: FormGroup) {
        this.viewData.form.Name["vi"] = formGroup.get('ViName').value;
        this.viewData.form.Name['en'] = formGroup.get('EnName').value;
        this.viewData.form.Description["vi"] = formGroup.get('Description').value;
        this.viewData.form.Color = formGroup.get('Color').value;
        this.viewData.form.Icon = formGroup.get('Icons').value;
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "SELLING_POINT_TYPES.LIST", page: '/selling-point-types' },
            { title: "SELLING_POINT_TYPES.NEW_SELLING_POINT_TYPE", page: '/selling-point-types/create' }
        ]);
    }

    private generateForm(): FormGroup {
        return new FormGroup({
            ViName: new FormControl('', [Validators.required]),
            EnName: new FormControl('', [Validators.required]),
            Description: new FormControl('', [Validators.required]),
            Color: new FormControl('', [Validators.required]),
            Icons: new FormControl('', [MinArray.validate(1)]),
        });
    }
}