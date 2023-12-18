import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { BrandsDetailState } from '../../states';

import {
    BrandModel,
    ButtonOptionModel,
    GnActionModel,

    LanguagePipe,

    ActionType,
    ResourceType,

    MaxWords,
    SellingPointMaxWords,

    SystemAlertService,
    BrandService,
    SubheaderService,
} from '../../../../../../core/core.module';

import { MenuService } from '../../services';
import { BrandDefaultSellingPointViewModel } from '../../view-models/index';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'm-brands-default-selling-point',
    templateUrl: './brands-default-selling-point.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrandsDefaultSellingPointPage implements OnInit, OnDestroy {

    private _obsers: any[] = [];

    private _readyConditions: Map<string, boolean> = new Map([
        ["Brand", false]
    ]);

    lang: string = "vi";

    form: FormGroup;

    brandEmbryo: FormControl = new FormControl({});

    sellingPointMaxWords = SellingPointMaxWords;

    viewControl: any = {
        submitting: false,
        ready: false,
        loading$: new BehaviorSubject<boolean>(false)
    }

    viewData: any = {
        brand: new BrandModel()
    }

    viewModel: any = {
        sellingPoint: new BrandDefaultSellingPointViewModel(),
        form: new BrandDefaultSellingPointViewModel(),
    }

    constructor(
        private _brandsDetailState: BrandsDetailState,
        private _subheaderService: SubheaderService,
        private _menuService: MenuService,
        private _brandService: BrandService,
        private _systemAlertService: SystemAlertService,
        private _translate: TranslateService,

    ) {
        this.generateForm();
    }

    async ngOnInit() {
        this.viewControl.loading$.next(true);

        this.viewData.brand = this._brandsDetailState.brand$.getValue();

        if (this.viewData.brand.Id.length > 0) {
            this._readyConditions.set("Brand", true);
            this.init();
        }

        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    async save() {
        const controls = this.form.controls;
        const appointmentControls = this.appointmentForm.controls;
        const shareControls = this.shareForm.controls;

        if (this.form.invalid) {
            Object.keys(controls).forEach(controlName => {
                controls[controlName].markAsTouched();
                controls[controlName].markAsDirty();
            });

            Object.keys(appointmentControls).forEach(controlName => {
                appointmentControls[controlName].markAsTouched();
                appointmentControls[controlName].markAsDirty();
            });

            Object.keys(shareControls).forEach(controlName => {
                shareControls[controlName].markAsTouched();
                shareControls[controlName].markAsDirty();
            });

            this._systemAlertService.error(this._translate.instant("COMMON.ERROR.FORM_INVALID"));

            return;
        }

        await this.update();
    }

    async update() {
        if (this.viewControl.submitting) {
            return;
        }

        this.viewControl.submitting = true;
        this.viewControl.loading$.next(true);

        let brand = this.parseBrandFromForm(this.form);

        let data = await this._brandService.updateBrandDefaultSP(brand);

        this.viewControl.submitting = false;

        if (data) {
            this._systemAlertService.success("Cập nhật thông tin thương hiệu thành công.");

            let result = await this._brandService.get(brand.Id);

            this.viewControl.ready = false;

            this._brandsDetailState.brand$.next(result);
        }

        this.viewControl.loading$.next(false);
    }

    private init(): void {
        if (Array.from(this._readyConditions.values()).filter(x => x === false).length === 0) {
            if (this.viewControl.ready) return;

            this.viewControl.ready = true;

            this.bindBreadcrumbs();

            this.viewModel.sellingPoint = this.parseViewModel(this.viewData.brand);

            this.parseFormGroup(JSON.parse(JSON.stringify(this.viewData.brand)));

            this.parseFormToEmbryo(this.form);

            this._brandsDetailState.menu$.next(this._menuService.getBrandsDetailMenu());

            this.viewControl.loading$.next(false);
        }
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "BRANDS.LIST", page: '/brands' },
            { title: new LanguagePipe().transform(this.viewData.brand.Name), page: `/brands/${this.viewData.brand.Id}` },
            { title: "BRANDS.DEFAULT_SELLING_POINT", page: `/brands/${this.viewData.brand.Id}/default-selling-point` }
        ]);
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this.form.valueChanges.subscribe(() => {
                this.parseFormToEmbryo(this.form);
            })
        );

        this._obsers.push(
            this._brandsDetailState.brand$.subscribe(value => {
                if (value.Id.length > 0) {
                    this.viewData.brand = value;

                    this._readyConditions.set("Brand", true);

                    this.init();
                }
            })
        );

        this._obsers.push(
            this._translate.onLangChange.subscribe(() => {
                if (this._readyConditions.get("Brand")) {
                    this.bindBreadcrumbs();
                }
            })
        );
    }

    private parseFormToEmbryo(form: FormGroup) {
        let preview: any = {
            Name: "",
            Slogan: "",
            SellingPointTitle: "",
            SellingPointDescription: "",
            Logo: "",
            Backgrounds: [],
            Share: {},
            Appointment: {}
        }

        preview.Name = new LanguagePipe().transform(this.viewData.brand.Name);
        preview.Slogan = new LanguagePipe().transform(this.viewData.brand.Description);
        preview.SellingPointTitle = form.get('SellingPointTitle').value;
        preview.SellingPointDescription = form.get('SellingPointDescription').value;
        preview.Backgrounds = form.get('SellingPointPosters').value;

        preview.Share = this.parseButtonOptionForm(this.shareForm);
        preview.Appointment = this.parseButtonOptionForm(this.appointmentForm);

        this.brandEmbryo.setValue(preview)
    }

    private parseViewModel(brand: BrandModel): BrandDefaultSellingPointViewModel {
        let vm = new BrandDefaultSellingPointViewModel();

        vm.Title = new LanguagePipe().transform(brand.SellingPoint.Title);
        vm.TitleEn = new LanguagePipe().transform(brand.SellingPoint.Title, "en");

        vm.Description = new LanguagePipe().transform(brand.SellingPoint.Description);
        vm.DescriptionEn = new LanguagePipe().transform(brand.SellingPoint.Description, "en");

        vm.Posters = brand.SellingPoint.Gallery || [];
        vm.Actions = JSON.parse(JSON.stringify(brand.Actions.filter(x => x.Service.ActionType == ActionType.SpService).map(x => x.Service)));

        return vm;
    }

    private parseFormGroup(brand: BrandModel) {
        this.form.get('SellingPointTitle').setValue(new LanguagePipe().transform(brand.SellingPoint.Title));
        this.form.get('SellingPointTitleEn').setValue(new LanguagePipe().transform(brand.SellingPoint.Title, "en"));

        this.form.get('SellingPointDescription').setValue(new LanguagePipe().transform(brand.SellingPoint.Description));
        this.form.get('SellingPointDescriptionEn').setValue(new LanguagePipe().transform(brand.SellingPoint.Description, "en"));

        this.form.get('SellingPointPosters').setValue(brand.SellingPoint.Gallery || []);
        this.form.get('SellingPointVideo').setValue(brand.Gallery.filter(x => x.Type == ResourceType.HLS || x.Type == ResourceType.Video) || []);
        this.form.get('SellingPointActions').setValue(JSON.parse(JSON.stringify(brand.Actions.filter(x => x.Service.ActionType == ActionType.SpService).map(x => x.Service))));

        this.setButtonOptionForm(brand.SellingPoint.Options['AppointmentButton'], this.appointmentForm);
        this.setButtonOptionForm(brand.SellingPoint.Options['ShareButton'], this.shareForm);
    }

    private parseBrandFromForm(form: FormGroup): BrandModel {
        let brand = new BrandModel();

        brand.Id = this.viewData.brand.Id;

        brand.SellingPoint.Title[this.lang] = form.get('SellingPointTitle').value;
        brand.SellingPoint.Title["en"] = form.get('SellingPointTitleEn').value;

        brand.SellingPoint.FullTitle[this.lang] = form.get('SellingPointTitle').value;
        brand.SellingPoint.FullTitle["en"] = form.get('SellingPointTitleEn').value;

        brand.SellingPoint.Description[this.lang] = form.get('SellingPointDescription').value;
        brand.SellingPoint.Description["en"] = form.get('SellingPointDescriptionEn').value;

        brand.SellingPoint.Options = {
            AppointmentButton: this.parseButtonOptionForm(this.appointmentForm),
            ShareButton: this.parseButtonOptionForm(this.shareForm)
        }

        form.get('SellingPointPosters').value.forEach(element => {
            brand.SellingPoint.Gallery.push(element);
        });

        form.get('SellingPointVideo').value.forEach(element => {
            brand.SellingPoint.Gallery.push(element);
        });

        for (let service of form.get('SellingPointActions').value) {
            let action = new GnActionModel();
            action.Service = service;
            brand.Actions.push(action);
        }

        return brand;
    }

    private generateForm() {
        this.form = new FormGroup({
            SellingPointTitle: new FormControl('', [<any>Validators.required, <any>MaxWords.validate(SellingPointMaxWords.MaxTitle)]),
            SellingPointTitleEn: new FormControl('', [<any>MaxWords.validate(SellingPointMaxWords.MaxTitle)]),
            SellingPointDescription: new FormControl('', [<any>Validators.required, <any>MaxWords.validate(SellingPointMaxWords.MaxDescription)]),
            SellingPointDescriptionEn: new FormControl('', [<any>MaxWords.validate(SellingPointMaxWords.MaxDescription)]),
            SellingPointPosters: new FormControl([], [<any>Validators.required]),
            SellingPointActions: new FormControl([], [<any>Validators.required]),
            SellingPointVideo: new FormControl(''),

            AppointmentButton: new FormGroup({
                IsVisible: new FormControl(true),
                IsEnabled: new FormControl(true),
                LabelVi: new FormControl("", [<any>Validators.required]),
                LabelEn: new FormControl("", [<any>Validators.required])
            }),
            ShareButton: new FormGroup({
                IsVisible: new FormControl(true),
                IsEnabled: new FormControl(true),
                LabelVi: new FormControl("", [<any>Validators.required]),
                LabelEn: new FormControl("", [<any>Validators.required])
            }),
        });
    }

    private setButtonOptionForm(model: ButtonOptionModel, form: FormGroup): void {
        form.get("IsVisible").setValue(model.IsVisible);
        form.get("IsEnabled").setValue(model.IsEnabled);
        form.get("LabelVi").setValue(model.Label['vi']);
        form.get("LabelEn").setValue(model.Label["en"]);
    }

    private parseButtonOptionForm(form: FormGroup): ButtonOptionModel {
        let model = new ButtonOptionModel();

        model.IsVisible = form.get("IsVisible").value;
        model.IsEnabled = form.get("IsEnabled").value;
        model.Label = {
            vi: form.get("LabelVi").value,
            en: form.get("LabelEn").value,
        }

        return model;
    }

    get appointmentForm(): FormGroup {
        return this.form.get('AppointmentButton') as FormGroup;
    }

    get shareForm(): FormGroup {
        return this.form.get('ShareButton') as FormGroup;
    }


}
