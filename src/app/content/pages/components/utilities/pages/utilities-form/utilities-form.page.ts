import { OnInit, OnDestroy, ChangeDetectionStrategy, Component, ViewChild, ElementRef, Renderer } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { BehaviorSubject } from "rxjs";

import {
    UtilityModel,
    MinArray,
    UtilityService,
    SubheaderService,
    SystemAlertService,
    IconService,
} from "../../../../../../core/core.module";

import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-utilities-form-list',
    templateUrl: './utilities-form.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UtilitiesFormPage implements OnInit, OnDestroy {
    @ViewChild("fileInputMulti", { static: true }) fileInputMulti: ElementRef;

    private _obsers: any[] = [];

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false),
    }

    viewForm: any = {
        formGroup: FormGroup,
    }

    viewData: any = {
        form: new UtilityModel,
    }

    constructor(
        private _subheaderService: SubheaderService,
        private _utilityService: UtilityService,
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

        this.parseUtilityForm(this.viewForm.formGroup);
        this.createUtility();
    }

    async createUtility() {
        this.viewControl.loading$.next(true);

        let data = await this._utilityService.create(this.viewData.form);

        this.viewControl.loading$.next(false);

        if (data) {
            this._systemAlertService.success(this._translate.instant("UTILITIES.CREATE_SUCCESSFUL"));
            this._utilityService.reset();
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

    private parseUtilityForm(formGroup: FormGroup) {
        this.viewData.form.Name["vi"] = formGroup.get('ViName').value;
        this.viewData.form.Name['en'] = formGroup.get('EnName').value;
        this.viewData.form.Description["vi"] = formGroup.get('Description').value;
        this.viewData.form.Icon = formGroup.get('Icons').value;
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "UTILITIES.LIST", page: '/utilities' },
            { title: "UTILITIES.NEW_UTIL", page: '/utilities/create' }
        ]);
    }

    private generateForm(): FormGroup {
        return new FormGroup({
            ViName: new FormControl('', [Validators.required]),
            EnName: new FormControl('', [Validators.required]),
            Description: new FormControl('', [Validators.required]),
            Icons: new FormControl('', [MinArray.validate(1)]),
        });
    }

}