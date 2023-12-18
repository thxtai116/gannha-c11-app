import { Component, OnInit, ChangeDetectionStrategy, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { BehaviorSubject } from 'rxjs';

import { TranslateService } from '@ngx-translate/core';

import {
    GalleryExplorerModel,

    SystemAlertService,
    ResourceService,
} from '../../../../../../core/core.module';

@Component({
    selector: 'rbp-files-info',
    templateUrl: './files-info.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilesInfoComponent implements OnInit {

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false),
        submitting: false
    }

    viewData: any = {
        model: new GalleryExplorerModel(),
    }

    form: FormGroup;

    constructor(
        private _systemAlertService: SystemAlertService,
        private _translate: TranslateService,
        private _resourceService: ResourceService,
        public _dialogRef: MatDialogRef<FilesInfoComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.viewData.model = data.file;
        this.form = this.generateForm();
    }

    ngOnInit(): void {
        this.init();
    }

    ngAfterViewInit(): void {
    }

    onCancel(): void {
        this._dialogRef.close();
    }

    onSubmit(): void {
        const controls = this.form.controls;

        if (this.form.invalid) {
            Object.keys(controls).forEach(controlName => {
                controls[controlName].markAsTouched();
                controls[controlName].markAsDirty();
            });

            return;
        }

        if (this.viewControl.submitting)
            return;

        this.viewControl.submitting = true;

        let model = this.parseForm();

        this.edit(this.viewData.model.Id, model);
    }

    edit(id: string, model: any): void {
        this.viewControl.loading$.next(true);

        this._resourceService.update(id, model).then(res => {
            if (res) {
                this._systemAlertService.success(this._translate.instant("RESOURCES.CRUD_MESSAGE.UPDATE_SUCCESSFUL"));

                this._dialogRef.close(true);
            }
        }).finally(() => {
            this.viewControl.loading$.next(false);
            this.viewControl.submitting = false;
        });
    }

    private init(): void {
        this.setForm(this.viewData.model);
    }

    private setForm(model: GalleryExplorerModel): void {
        this.ctrlName.setValue(model.Name);
        this.ctrlCaption.setValue(model.Caption);
    }

    private parseForm(): any {
        let model = {};

        model['Name'] = this.ctrlName.value;
        model['Caption'] = this.ctrlCaption.value;

        return model;
    }

    private generateForm(): FormGroup {
        return new FormGroup({
            Name: new FormControl("", [<any>Validators.required]),
            Caption: new FormControl("")
        })
    }

    //#region 

    get ctrlName() { return this.form.get("Name"); }

    get ctrlCaption() { return this.form.get("Caption"); }

    //#endregion
}
