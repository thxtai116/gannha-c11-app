import { Component, ChangeDetectionStrategy, Inject, forwardRef } from "@angular/core";
import { FormGroup, FormControl, Validators, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';

import { CallServiceModel } from '../../models/call-service.model';


import { SystemAlertService, LanguagePipe } from '../../../../../../../core/core.module';

@Component({
    selector: 'm-call-service',
    templateUrl: 'call-service.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => CallServiceComponent)
        }
    ],
})
export class CallServiceComponent {
    readonly: boolean = true;

    viewModel: any = {
        Phone: "",
        Title: ""
    }

    viewForm: FormGroup;

    lang: string = "vi";

    constructor(
        private _systemAlertService: SystemAlertService,
        private _translate: TranslateService,
        public dialogRef: MatDialogRef<CallServiceComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.viewForm = this.generateFormGroup();
    }

    ngOnInit(): void {
        if (this.data) {
            this.readonly = this.data.readonly;

            if (this.data.model) {
                if (this.readonly) {
                    this.setViewModel(this.data.model);
                } else {
                    this.setFormValue(this.data.model);
                }
            }
        }
    }

    onCancelClick(): void {
        this.dialogRef.close();
    }

    onSubmit(): void {
        const controls = this.viewForm.controls;

        Object.keys(controls).forEach(controlName =>
            controls[controlName].markAsTouched()
        );

        if (!this.viewForm.valid) {
            this._systemAlertService.error(this._translate.instant("COMMON.ERROR.FORM_INVALID"));

            return;
        }

        let model = this.getModel(this.viewForm);

        this.dialogRef.close({
            data: model
        });
    }

    private generateFormGroup(): FormGroup {
        return new FormGroup({
            Phone: new FormControl(''),
            Title: new FormControl('', [<any>Validators.required])
        });
    }

    private getModel(form: FormGroup): CallServiceModel {
        let model = new CallServiceModel();

        model.Title[this.lang] = form.get("Title").value;
        model.Phone = form.get("Phone").value && form.get("Phone").value.length > 0 ? form.get("Phone").value : null;

        return model;
    }

    private setViewModel(model: CallServiceModel): void {
        this.viewModel.Phone = model.Phone
        this.viewModel.Title = new LanguagePipe().transform(model.Title);
    }

    private setFormValue(model: CallServiceModel): void {
        this.viewForm.get("Phone").setValue(model.Phone);
        this.viewForm.get("Title").setValue(new LanguagePipe().transform(model.Title));
    }
}