import { OnInit, OnDestroy, ChangeDetectionStrategy, Component, ViewChild, ElementRef, Renderer } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";

import { BehaviorSubject } from "rxjs";
import { TranslateService } from '@ngx-translate/core';


import {
    UtilityService,
    SubheaderService,
    SystemAlertService,
    UtilityModel,
    MinArray,
    IconService,
    LanguagePipe,
} from "../../../../../../core/core.module";
@Component({
    selector: 'app-utilities-detail-list',
    templateUrl: './utilities-detail.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UtilitiesDetailPage implements OnInit, OnDestroy {
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
        utility: new UtilityModel,
    }

    constructor(
        private _route: ActivatedRoute,
        private _utilitiyService: UtilityService,
        private _iconService: IconService,
        private _subheaderService: SubheaderService,
        private _systemAlertService: SystemAlertService,
        private _translate: TranslateService,
        private _renderer: Renderer,
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

    cancel() {
        this.parseUtilityToForm(JSON.parse(JSON.stringify(this.viewModel.utility)));

        this.viewControl.editMode = false;
    }

    uploadIcon() {
        let event = new MouseEvent('click', { bubbles: true });

        this._renderer.invokeElementMethod(this.fileInputMulti.nativeElement, "dispatchEvent", [event]);
    }


    async save() {
        if (this.viewControl.submitting) return;

        if (!this.viewForm.formGroup.valid) {
            this._systemAlertService.error(this._translate.instant("COMMON.ERROR.FORM_INVALID"));
            return;
        }

        let utility = this.parseFormToModel(this.viewForm.formGroup);

        this.viewControl.submitting = true;

        this.viewControl.loading$.next(true);

        let result = await this._utilitiyService.update(utility);

        if (result) {
            this._systemAlertService.success(this._translate.instant("UTILITIES.UPDATE_SUCCESSFULF"));
            this._utilitiyService.reset();

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
                this._utilitiyService.get(id)
            ]).then(value => {
                this.viewModel.utility = value[0];

                this.parseUtilityToForm(JSON.parse(JSON.stringify(this.viewModel.utility)));

                this.bindBreadcrumbs();

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

    private parseUtilityToForm(util: UtilityModel) {
        this.viewForm.formGroup.get('ViName').setValue(new LanguagePipe().transform(util.Name));
        this.viewForm.formGroup.get('EnName').setValue(new LanguagePipe().transform(util.Name, "en"));
        this.viewForm.formGroup.get('Description').setValue(new LanguagePipe().transform(util.Description));
        this.viewForm.formGroup.get('Icons').setValue(util.Icon);
    }

    private parseFormToModel(form: FormGroup): UtilityModel {
        let util: UtilityModel = new UtilityModel();

        util.Id = this.viewModel.utility.Id;
        util.Name["vi"] = form.get("ViName").value;
        util.Name["en"] = form.get("EnName").value;
        util.Description["vi"] = form.get("Description").value;
        util.Icon = form.get("Icons").value;

        return util;
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "UTILITIES.LIST", page: '/utilities' },
            { title: "UTILITIES.DETAIL", page: '/utilities/:id' }
        ]);
    }

    private generateCreateForm(): FormGroup {
        return new FormGroup({
            ViName: new FormControl('', [Validators.required]),
            EnName: new FormControl('', [Validators.required]),
            Description: new FormControl('', [Validators.required]),
            Icons: new FormControl('', [MinArray.validate(1)]),
        })
    }
}