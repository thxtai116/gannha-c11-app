import { ChangeDetectionStrategy, Component, OnInit, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';

import { MembershipModel } from '../../models';

import {
    LanguagePipe,

    SystemAlertService
} from '../../../../../../../core/core.module';

@Component({
    selector: 'm-membership',
    templateUrl: './membership.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MembershipComponent implements OnInit {
    readonly: boolean = true;

    form: FormGroup;

    lang: string = "vi";

    constructor(
        private _systemAlertService: SystemAlertService,
        private _translate: TranslateService,
        public dialogRef: MatDialogRef<MembershipComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.form = this.generateFormGroup();
    }

    ngOnInit(): void {
        if (this.data && this.data.model) {
            this.setFormValue(this.data.model);
        }
    }

    onCancelClick(): void {
        this.dialogRef.close();
    }

    onSubmit(): void {
        const controls = this.form.controls;

        Object.keys(controls).forEach(controlName =>
            controls[controlName].markAsTouched()
        );

        if (!this.form.valid) {
            this._systemAlertService.error(this._translate.instant("COMMON.ERROR.FORM_INVALID"));

            return;
        }

        let model = this.getModel(this.form);

        this.dialogRef.close({
            data: model
        });
    }

    private getModel(form: FormGroup): MembershipModel {
        let model = new MembershipModel();
        let queries = new Array<any>();

        queries.push({ key: "public", value: form.get("Public").value });
        queries.push({ key: "phone", value: form.get("Phone").value });
        queries.push({ key: "email", value: form.get("Email").value });

        model.Title[this.lang] = form.get("Title").value;
        model.Query = this.parseToQuery(queries);

        return model;
    }

    private setFormValue(model: MembershipModel): void {
        this.form.get("Title").setValue(new LanguagePipe().transform(model.Title));

        for (let item of model.Query.split("&")) {
            let queries = item.split("=");
            let key = queries[1].charAt(0).toUpperCase() + queries[1].substring(1);

            if (this.form.get(key)) {
                this.form.get(key).setValue(true);
            }
        }
    }

    private generateFormGroup(): FormGroup {
        return new FormGroup({
            Title: new FormControl('', [<any>Validators.required]),
            Public: new FormControl({ value: true, disabled: true }),
            Phone: new FormControl(false),
            Email: new FormControl(false),
        });
    }

    private parseToQuery(items: any): string {
        let queries = new Array<string>();

        for (let item of items) {
            if (item.value) {
                queries.push(`claim=${item.key}`);
            }
        }
        return queries.join("&");
    }
}
