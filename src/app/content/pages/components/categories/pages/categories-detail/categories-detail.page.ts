import { Component, ChangeDetectionStrategy, ViewChild, ElementRef, Renderer, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import {
    CategoryModel,
    IconService,
    SystemAlertService,
    SubheaderService,
    CategoryService,
    ConfirmService,
    LanguagePipe
} from '../../../../../../core/core.module';


@Component({
    selector: 'm-categories-detail',
    templateUrl: 'categories-detail.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesDetailPage implements OnInit {

    @ViewChild("fileInputMulti", { static: true }) fileInputMulti: ElementRef;

    private _obsers: Subscription[] = [];

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false),
        editMode: false,
        submitting: false,
    }

    viewForm: any = {
        formGroup: FormGroup,
    }

    viewModel: any = {
        category: new CategoryModel(),
    }

    constructor(
        private _renderer: Renderer,
        private _route: ActivatedRoute,
        private _categoryService: CategoryService,
        private _iconService: IconService,
        private _systemAlertService: SystemAlertService,
        private _subheaderService: SubheaderService,
        private _translate: TranslateService,
        private _confirmService: ConfirmService,
    ) {
        this.viewForm.formGroup = this.generateFormGroup();
    }

    ngOnInit(): void {
        this.viewControl.loading$.next(true);

        this.init();
    }

    ngOnDestroy(): void {
        this._obsers.forEach(x => x.unsubscribe());
    }

    edit() {
        this.viewControl.editMode = true;
    }

    cancel() {
        this.parseModelToForm(JSON.parse(JSON.stringify(this.viewModel.category)));

        this.viewControl.editMode = false;
    }

    async save() {
        if (this.viewControl.submitting) return;

        if (!this.viewForm.formGroup.valid) {
            this._systemAlertService.error(this._translate.instant("COMMON.ERROR.FORM_INVALID"));
            return;
        }

        let category = this.parseFormToModel(this.viewForm.formGroup);

        this.viewControl.submitting = true;

        this.viewControl.loading$.next(true);

        let result = await this._categoryService.update(category);

        if (result) {
            this._systemAlertService.success(this._translate.instant("CATEGORIES.UPDATE_SUCCESSFUL"));

            await this.init();
        }

        this.viewControl.loading$.next(false);

        this.viewControl.submitting = false;

        this.viewControl.editMode = false;
    }

    activate() {
        const dialogRef = this._confirmService.show(this._translate.instant('COMMON.CONFIRMATION'), this._translate.instant('CATEGORIES.ACTIVATE_COMFIRM'));

        let sub = dialogRef.afterClosed().subscribe(res => {
            if (!res) {
                return;
            }

            this.viewControl.loading$.next(true);

            Promise.all([
                this._categoryService.activate(this.viewModel.category.Id)
            ]).then(value => {
                if (value[0]) {
                    this._systemAlertService.success(this._translate.instant('COMMON.ACTIVATE_SUCCESS'));

                    this.init();
                } else {
                    this.viewControl.loading$.next(false);
                }
            }).catch(() => {
                this.viewControl.loading$.next(false);
            }).finally(() => {
                sub.unsubscribe();
            });
        });
    }

    deactivate() {
        const dialogRef = this._confirmService.show(this._translate.instant('COMMON.CONFIRMATION'), this._translate.instant('CATEGORIES.DEACTIVATE_COMFIRM'));

        let sub = dialogRef.afterClosed().subscribe(res => {
            if (!res) {
                return;
            }

            this.viewControl.loading$.next(true);

            Promise.all([
                this._categoryService.deactivate(this.viewModel.category.Id)
            ]).then(value => {
                if (value[0]) {
                    this._systemAlertService.success(this._translate.instant('COMMON.DEACTIVATE_SUCCESS'));

                    this.init();
                } else {
                    this.viewControl.loading$.next(false);
                }
            }).catch(() => {
                this.viewControl.loading$.next(false);
            }).finally(() => sub.unsubscribe());
        });
    }

    uploadIcon() {
        let event = new MouseEvent('click', { bubbles: true });

        this._renderer.invokeElementMethod(this.fileInputMulti.nativeElement, "dispatchEvent", [event]);
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

                    this.viewForm.formGroup.get("Icon").setValue([file.name.substring(0, file.name.lastIndexOf('.'))]);
                }
            }

            this.fileInputMulti.nativeElement.value = "";

            this.viewControl.loading$.next(false);
        }
    }

    private init() {
        let id = this._route.snapshot.params["id"];

        if (id) {
            Promise.all([
                this._categoryService.get(id)
            ]).then(value => {
                this.viewModel.category = value[0]

                this.bindBreadcrumbs();

                this.parseModelToForm(JSON.parse(JSON.stringify(this.viewModel.category)));

                this.viewControl.loading$.next(false);

            }).catch(() => {
                this.viewControl.loading$.next(false);
            });
        }
    }

    private parseFormToModel(form: FormGroup): CategoryModel {
        let cate = new CategoryModel();

        cate.Name["vi"] = form.get('ViName').value;
        cate.Name["en"] = form.get('EnName').value;
        cate.Description["vi"] = form.get('ViName').value;
        cate.PublicService = form.get('PublicService').value;
        cate.Icon = form.get('Icon').value;
        cate.Tags = form.get('Tags').value.map(x => x.Name);
        cate.Order = form.get('Order').value;

        cate.AppId = this.viewModel.category.AppId;
        cate.ParentId = this.viewModel.category.ParentId;
        cate.Id = this.viewModel.category.Id;

        return cate;
    }

    private parseModelToForm(cate: CategoryModel) {
        this.viewForm.formGroup.get('ViName').setValue(new LanguagePipe().transform(cate.Name));
        this.viewForm.formGroup.get('EnName').setValue(new LanguagePipe().transform(cate.Name, "en"));
        this.viewForm.formGroup.get('Order').setValue(cate.Order);
        this.viewForm.formGroup.get('Tags').setValue(cate.Tags.map(x => { return { Id: "", Name: x } }));
        this.viewForm.formGroup.get('Icon').setValue(cate.Icon);
        this.viewForm.formGroup.get('PublicService').setValue(cate.PublicService);
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "CATEGORIES.LIST", page: '/brand-categories' },
            { title: "CATEGORIES.DETAIL", page: '/brand-categories/:id' }
        ]);
    }

    private generateFormGroup() {
        return new FormGroup({
            ViName: new FormControl('', [<any>Validators.required]),
            EnName: new FormControl('', [<any>Validators.required]),
            Order: new FormControl(0, [<any>Validators.required]),
            Tags: new FormControl([]),
            Icon: new FormControl([], [<any>Validators.required]),
            PublicService: new FormControl(false)
        })
    }
}