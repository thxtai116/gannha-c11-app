import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import {
    CommerceCategoryService,
    SystemAlertService,
    CommerceCategoryModel
} from '../../../../../../core/core.module';

@Component({
    selector: 'm-commerce-categories-form',
    templateUrl: './commerce-categories-form.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommerceCategoriesFormComponent implements OnInit {
    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false),
        submitting: false,
    };

    form: FormGroup;

    constructor(
        private _commerceCategoryService: CommerceCategoryService,
        private _systemAlertService: SystemAlertService,
        private _translate: TranslateService,
        public dialogRef: MatDialogRef<CommerceCategoriesFormComponent>,
    ) {
        this.form = this.generateFormGroup();
    }

    ngOnInit(): void {
    }

    async onSubmit() {
        if (this.viewControl.submitting) {
            return;
        }

        this.viewControl.submitting = true;

        if (this.form.invalid) {
            const controls = this.form.controls;

            Object.keys(controls).forEach(controlName =>
                controls[controlName].markAsTouched()
            );

            this._systemAlertService.error(this._translate.instant("COMMON.ERROR.FORM_INVALID"));

            this.viewControl.submitting = false;

            return;
        }

        this.viewControl.loading$.next(true);

        let result = await this.createCommerceCategory();

        this.viewControl.loading$.next(false);

        this.viewControl.submitting = false;

        if (result) {
            this._systemAlertService.success(this._translate.instant("COMMERCE_CATEGORIES.CREATE_SUCCESSFUL"));

            this.dialogRef.close({ successful: true });
        }
    }

    onCancelClick(): void {
        this.dialogRef.close();
    }

    private async createCommerceCategory() {
        let model = this.parseFormToModel(this.form);

        return await this._commerceCategoryService.create(model);
    }

    private parseFormToModel(form: FormGroup): CommerceCategoryModel {
        let model = new CommerceCategoryModel();

        model.Name = form.get('Name').value;
        model.DisplayOrder = form.get('DisplayOrder').value;
        model.Published = form.get('Published').value;

        return model;
    }

    private generateFormGroup(): FormGroup {
        return new FormGroup({
            Name: new FormControl('', [<any>Validators.required]),
            DisplayOrder: new FormControl(1, [<any>Validators.required, <any>Validators.min(1)]),
            Published: new FormControl(true),
        })
    }
}
