import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, Renderer, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import {
    ProductSeries,
    CategoryModel,
    IconService,
    SystemAlertService,
    SubheaderService,
    CategoryService,
    LanguagePipe,
} from '../../../../../../core/core.module';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'm-categories-form',
    templateUrl: 'categories-form.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesFormPage implements OnInit, OnDestroy {

    @ViewChild("fileInputMulti", { static: true }) fileInputMulti: ElementRef;

    private parentId: string = "";
    parentName: string = "";

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(true),
        submitting: false,
    }

    viewForm: any = {
        formGroup: FormGroup,
    }

    constructor(
        private _renderer: Renderer,
        private _route: ActivatedRoute,
        private _router: Router,
        private _changeRef: ChangeDetectorRef,
        private _categoryService: CategoryService,
        private _iconService: IconService,
        private _systemAlertService: SystemAlertService,
        private _subheaderService: SubheaderService,
        private _translate: TranslateService,
    ) {
        this.generateFormGroup();
    }

    ngOnInit(): void {
        this.setParamsFromQuery();
        this.bindBreadcrumbs();

        this.viewControl.loading$.next(false);
    }

    ngOnDestroy(): void {
    }

    async save() {
        if (this.viewControl.submitting) return;

        if (!this.viewForm.formGroup.valid) {

            const controls = this.viewForm.formGroup.controls;

            Object.keys(controls).forEach(controlName =>
                controls[controlName].markAsTouched()
            );

            this._systemAlertService.error(this._translate.instant("COMMON.ERROR.FORM_INVALID"));
            return;
        }

        let category = this.parseFormtoModel(this.viewForm.formGroup);

        this.viewControl.submitting = true;

        this.viewControl.loading$.next(true);

        let result = await this._categoryService.create(category);

        this.viewControl.loading$.next(false);

        this.viewControl.submitting = false;

        if (result) {
            this._systemAlertService.success(this._translate.instant("CATEGORIES.CREATE_SUCCESSFUL"));

            this._router.navigate(["/brand-categories", result[0]],
                {
                    queryParams: null
                });
        }
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

    private parseFormtoModel(form: FormGroup): CategoryModel {
        let cate: CategoryModel = new CategoryModel();

        cate.AppId = ProductSeries.Brand;
        cate.Name['vi'] = form.get('ViName').value;
        cate.Name['en'] = form.get('EnName').value;
        cate.Description['vi'] = form.get('ViName').value;
        cate.Order = form.get('Order').value;
        cate.Tags = form.get('Tags').value.map(x => x.Name);
        cate.Icon = form.get('Icon').value;
        cate.PublicService = form.get('PublicService').value;

        if (this.parentId.length > 0) {
            cate.ParentId = this.parentId;
        }

        return cate;
    }

    private async setParamsFromQuery() {
        this.parentId = this._route.snapshot.queryParams['parentId'];
        let parent = await this._categoryService.get(this.parentId);
        this.parentName = new LanguagePipe().transform(parent.Name);
        this._changeRef.detectChanges();
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "CATEGORIES.LIST", page: '/brand-categories' },
            { title: "CATEGORIES.NEW_CATEGORY", page: '/brand-categories/create' }
        ]);
    }

    private generateFormGroup() {
        this.viewForm.formGroup = new FormGroup({
            ViName: new FormControl('', [<any>Validators.required]),
            EnName: new FormControl('', [<any>Validators.required]),
            Order: new FormControl(1, [<any>Validators.required]),
            Tags: new FormControl([]),
            Icon: new FormControl('', [<any>Validators.required]),
            PublicService: new FormControl(false),
        })
    }
}