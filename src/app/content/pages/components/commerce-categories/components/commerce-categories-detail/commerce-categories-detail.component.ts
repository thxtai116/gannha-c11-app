import { Component, OnInit, Inject, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';

import { BehaviorSubject } from 'rxjs';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import {
    CommerceCategoryModel,
    CommerceCategoryService,
    SystemAlertService
} from '../../../../../../core/core.module';

@Component({
    selector: 'm-commerce-categories-detail',
    templateUrl: './commerce-categories-detail.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommerceCategoriesDetailComponent implements OnInit {

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false),
        submitting: false,
    };

    viewData: any = {
        model: new CommerceCategoryModel()
    };



    form: FormGroup;

    constructor(
        private _commerceCategoryService: CommerceCategoryService,
        private _systemAlertService: SystemAlertService,
        private _translate: TranslateService,
        public dialogRef: MatDialogRef<CommerceCategoriesDetailComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.form = this.generateFormGroup();
    }

    ngOnInit(): void {
        if (this.data) {
            this.init(this.data);
        }
    }

    onCancelClick(): void {
        this.dialogRef.close();
    }

    private async init(id: string) {
        this.viewControl.loading$.next(true);

        this.viewData.model = await this._commerceCategoryService.get(id);

        this.viewControl.loading$.next(false);

        this.setForm(this.viewData.model);
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

        let result = await this.updateCommerceCategory();

        this.viewControl.loading$.next(false);

        this.viewControl.submitting = false;

        if (result) {
            this._systemAlertService.success(this._translate.instant("COMMERCE_CATEGORIES.UPDATE_SUCCESSFUL"));

            this.dialogRef.close({ successful: true });
        }
    }

    private async updateCommerceCategory() {
        let model = this.parseFormToModel(this.form);

        model.Id = this.viewData.model.Id;

        return await this._commerceCategoryService.update(model);
    }

    private parseFormToModel(form: FormGroup): CommerceCategoryModel {
        let model = new CommerceCategoryModel();

        model.Name = form.get('Name').value;
        model.DisplayOrder = form.get('DisplayOrder').value;
        model.Published = form.get('Published').value;

        return model;
    }

    private setForm(model: CommerceCategoryModel): void {
        this.form.controls["Name"].setValue(model.Name);
        this.form.controls["DisplayOrder"].setValue(model.DisplayOrder);
        this.form.controls["Published"].setValue(model.Published);
    }

    private generateFormGroup(): FormGroup {
        return new FormGroup({
            Name: new FormControl('', [<any>Validators.required]),
            DisplayOrder: new FormControl(1, [<any>Validators.required, <any>Validators.min(1)]),
            Published: new FormControl(true),
        })
    }
}
