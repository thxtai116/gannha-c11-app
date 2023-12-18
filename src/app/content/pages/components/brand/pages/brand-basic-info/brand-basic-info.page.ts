import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

import {
    BrandModel,
    UtilityModel,
    ResourceModel,
    BrandBasicInfoViewModel,

    SubheaderService,
    BrandService,
    SystemAlertService,

    ResourceType,

    LanguagePipe,
    ValidTime,
    GlobalState,
    CategoryModel,
    CategoryUtility,
    ButtonOptionModel,
} from '../../../../../../core/core.module';

import { BrandState } from '../../states';

@Component({
    selector: 'm-brand-basic-info.page',
    templateUrl: './brand-basic-info.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrandBasicInfoPage implements OnInit, OnDestroy {

    private _obsers: any[] = [];

    private _readyConditions: Map<string, boolean> = new Map([
        ["Brand", false],
        ["Utilities", false],
        ["Categories", false]
    ]);

    lang: string = "vi";

    form: FormGroup;

    brandEmbryo: FormControl = new FormControl({});

    viewControl: any = {
        submitting: false,
        ready: false,
        loading$: new BehaviorSubject<boolean>(false)
    }

    viewData: any = {
        brand: new BrandModel(),
        utilities: new Array<UtilityModel>(),
        subCategories: new Array<CategoryModel>(),
        filterCategories$: new BehaviorSubject<any[]>([]),
    }

    viewModel: any = {
        brand: new BrandBasicInfoViewModel(),
    }

    constructor(
        private _brandState: BrandState,
        private _globalState: GlobalState,
        private _categoryUtil: CategoryUtility,
        private _subheaderService: SubheaderService,
        private _brandService: BrandService,
        private _translate: TranslateService,
        private _systemAlertService: SystemAlertService,
    ) {
        this.form = this.generateUpdateForm();
    }

    ngOnInit(): void {
        this.viewControl.loading$.next(true);

        this.viewData.brand = this._brandState.brand$.getValue();

        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    async save() {
        const controls = this.form.controls;
        if (this.form.invalid) {
            Object.keys(controls).forEach(controlName => {
                controls[controlName].markAsTouched();
                controls[controlName].markAsDirty();
            });

            this._systemAlertService.error(this._translate.instant("COMMON.ERROR.FORM_INVALID"));

            return;
        }

        if (this.form.get('BrandOpeningHours').invalid) {
            this._systemAlertService.error("Vui lòng kiểm trả giờ hoạt động bị trùng lặp.");

            return;
        }

        await this.updateBasicInfo();
    }

    async updateBasicInfo() {
        if (this.viewControl.submitting) {
            return;
        }

        this.viewControl.submitting = true;

        this.viewControl.loading$.next(true);

        let brand = this.parseFormGroupToModel(this.form);

        let data = await this._brandService.partialUpdateBrandBasicInfo(brand);
        this.viewControl.submitting = false;

        this.viewControl.loading$.next(true);

        if (data) {
            this._systemAlertService.success(this._translate.instant("BRANDS.UPDATE_SUCCESSFUL"));

            this.reload();
        }
    }

    private reload() {
        this.viewControl.ready = false;

        this.viewControl.loading$.next(true);

        this._globalState.syncBrand.next(this.viewData.brand.Id);
    }

    private init(): void {
        if (Array.from(this._readyConditions.values()).filter(x => x === false).length === 0) {
            if (this.viewControl.ready)
                return;

            this.viewControl.ready = true;

            this.bindBreadcrumbs();

            this.viewModel.brand = this.parseToViewModel(JSON.parse(JSON.stringify(this.viewData.brand)));

            this.parseToFormGroup(JSON.parse(JSON.stringify(this.viewData.brand)));

            this.parseFormToEmbryo(this.form);

            this.viewControl.loading$.next(false);
        }
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: new LanguagePipe().transform(this.viewData.brand.Name), page: `/brand` },
            { title: "BRANDS.BASIC_INFO", page: `/brand/basic-info` }
        ]);
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this._translate.onLangChange.subscribe(() => {
                if (this._readyConditions.get("Brand")) {
                    this.bindBreadcrumbs();
                }
            })
        );

        this._obsers.push(
            this._brandState.brand$.subscribe(value => {
                if (value) {
                    this.viewData.brand = value;

                    this._readyConditions.set("Brand", true);

                    if (this.viewControl.ready) {
                        this.viewControl.ready = false;
                    }

                    this.init();
                }
            })
        );

        this._obsers.push(
            this._brandState.utilities$.subscribe(value => {
                if (value) {
                    this.viewData.utilities = value;
                    this._readyConditions.set("Utilities", true);
                    this.init();
                }
            })
        );

        this._obsers.push(
            this._brandState.subCategories$.subscribe(value => {
                if (value) {
                    let vm = this._categoryUtil.initFilterCategories(value, false);

                    this.viewData.subCategories = value;
                    this.viewData.filterCategories$.next(vm);

                    this._readyConditions.set("Categories", true);

                    this.init();
                }
            })
        )

        this._obsers.push(
            this.form.valueChanges.subscribe(() => {
                this.parseFormToEmbryo(this.form);
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

        preview.Name = form.get('BrandName').value;
        preview.Slogan = form.get('BrandDescription').value;
        preview.SellingPointTitle = new LanguagePipe().transform(this.viewData.brand.SellingPoint.Title);
        preview.SellingPointDescription = new LanguagePipe().transform(this.viewData.brand.SellingPoint.Description);
        preview.Logo = form.get('BrandLogo').value;
        preview.Backgrounds = this.viewData.brand.SellingPoint.Gallery;

        preview.Share = this.viewData.brand.SellingPoint.Options ? this.viewData.brand.SellingPoint.Options['ShareButton'] : new ButtonOptionModel();
        preview.Appointment = this.viewData.brand.SellingPoint.Options ? this.viewData.brand.SellingPoint.Options['AppointmentButton'] : new ButtonOptionModel();

        this.brandEmbryo.setValue(preview)
    }

    private parseToFormGroup(brand: BrandModel) {
        this.form.get('BrandName').setValue(new LanguagePipe().transform(brand.Name));
        this.form.get('BrandDescription').setValue(new LanguagePipe().transform(brand.Description));
        this.form.get('BrandTags').setValue(brand.Tags.map(x => { return { Id: "", Name: x } }));
        this.form.get('Utilities').setValue(brand.Utilities);

        this.form.get('BrandPhones').setValue(brand.Contact.Phone);
        this.form.get('BrandCompany').setValue(brand.Contact.CompanyName || "");
        this.form.get('BrandTaxCode').setValue(brand.Contact.TaxCode || "");

        this.form.get('BrandOpeningHours').setValue(brand.Timing);
        this.form.get('BrandCategories').setValue(brand.Categories);

        if (brand.Logo && brand.Logo.length > 0) {
            let logo: ResourceModel[] = [new ResourceModel()];

            logo[0].Url = brand.Logo;
            logo[0].Type = ResourceType.Image;

            this.form.get('BrandLogo').setValue(logo);
        }

        if (brand.Marker && brand.Marker.length > 0) {
            let marker: ResourceModel[] = [new ResourceModel()];

            marker[0].Url = brand.Marker;
            marker[0].Type = ResourceType.Image;

            this.form.get('BrandMarker').setValue(marker);
        }

        this.form.get('NearMeBrand').setValue(brand.Properties.indexOf("COL") > -1);
    }

    private parseFormGroupToModel(form: FormGroup): BrandModel {
        let brand = new BrandModel();

        brand.Id = this.viewData.brand.Id;
        brand.Name[this.lang] = form.get('BrandName').value;
        brand.Description[this.lang] = form.get('BrandDescription').value;
        brand.Tags = form.get('BrandTags').value.map(x => x.Name);
        brand.Utilities = form.get('Utilities').value;

        brand.Contact.Phone = form.get('BrandPhones').value;
        brand.Contact.CompanyName = form.get('BrandCompany').value;
        brand.Contact.TaxCode = form.get('BrandTaxCode').value;

        brand.Timing = form.get('BrandOpeningHours').value;

        if (form.get('BrandLogo').value.length > 0) {
            brand.Logo = form.get('BrandLogo').value[0].Url;
        }

        if (form.get('BrandMarker').value.length > 0) {
            brand.Marker = form.get('BrandMarker').value[0].Url;
        }

        return brand;
    }

    private parseToViewModel(brand: BrandModel): BrandBasicInfoViewModel {
        let vm = new BrandBasicInfoViewModel();

        vm.Name = new LanguagePipe().transform(brand.Name);
        vm.Slogan = new LanguagePipe().transform(brand.Description);
        vm.Categories = brand.CategoryNames.map(x => new LanguagePipe().transform(x));
        vm.Utilities = brand.Utilities;
        vm.Status = brand.Status;
        vm.Tags = brand.Tags;
        vm.Phones = brand.Contact.Phone;
        vm.Timing = brand.Timing;

        if (brand.Logo && brand.Logo.length > 0) {
            let logo = new ResourceModel();
            logo.Url = brand.Logo;
            logo.Type = ResourceType.Image;
            vm.Logo.push(logo);
        }

        if (brand.Marker && brand.Marker.length > 0) {
            let marker = new ResourceModel();

            marker.Url = brand.Marker;
            marker.Type = ResourceType.Image;

            vm.Logo.push(marker);
        }

        return vm;
    }

    private generateUpdateForm(): FormGroup {
        return new FormGroup({
            BrandName: new FormControl('', [<any>Validators.required]),
            BrandDescription: new FormControl(''),
            Utilities: new FormControl([]),
            BrandLogo: new FormControl([]),
            BrandMarker: new FormControl([]),
            BrandTags: new FormControl([]),
            BrandPhones: new FormControl(''),
            BrandOpeningHours: new FormControl('', [ValidTime.validate]),
            BrandCategories: new FormControl([], [<any>Validators.required]),
            NearMeBrand: new FormControl({ value: false, disabled: true }),
            BrandCompany: new FormControl(""),
            BrandTaxCode: new FormControl(""),
        });
    }
}
