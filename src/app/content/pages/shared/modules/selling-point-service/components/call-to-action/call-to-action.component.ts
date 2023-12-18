import { ChangeDetectionStrategy, Component, OnInit, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';

import { CallToActionModel } from '../../models';

import {
    LanguagePipe,

    SystemAlertService,
    ValidUrl
} from '../../../../../../../core/core.module';

@Component({
    selector: 'm-call-to-action',
    templateUrl: './call-to-action.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CallToActionComponent implements OnInit {
    readonly: boolean = true;

    viewModel: any = {
        Url: "",
        Title: ""
    }

    viewForm: FormGroup;

    lang: string = "vi";

    constructor(
        private _systemAlertService: SystemAlertService,
        private _translate: TranslateService,
        public dialogRef: MatDialogRef<CallToActionComponent>,
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
            Url: new FormControl('', [<any>Validators.required, ValidUrl.validate()]),
            Title: new FormControl('', [<any>Validators.required])
        });
    }

    private getModel(form: FormGroup): CallToActionModel {
        let model = new CallToActionModel();

        model.Title[this.lang] = form.get("Title").value;
        model.Url[this.lang] = form.get("Url").value;

        return model;
    }

    private setViewModel(model: CallToActionModel): void {
        this.viewModel.Url = new LanguagePipe().transform(model.Url);
        this.viewModel.Title = new LanguagePipe().transform(model.Title);
    }

    private setFormValue(model: CallToActionModel): void {
        this.viewForm.get("Url").setValue(new LanguagePipe().transform(model.Url));
        this.viewForm.get("Title").setValue(new LanguagePipe().transform(model.Title));
    }
}
