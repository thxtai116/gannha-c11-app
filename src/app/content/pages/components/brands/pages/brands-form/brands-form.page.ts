import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';

import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { BrandsState } from '../../states';
import {
    BrandModel,
    CategoryModel,
    TimingMode,
    TenantModel,
    UserInfoModel,
    TimingModel,
    SpecificTimingModel,

    BrandService,
    SystemAlertService,
    TenantService,
    SubheaderService,

    AppInsightsUtility,
    AppStatusUtility,
    CommonUtility,

    SellingPointMaxWords,
    MaxWords,
    RoleType,
    Day,
    LanguagePipe,
    ButtonOptionModel,
} from "../../../../../../core/core.module";

@Component({
    selector: 'm-brands-form',
    templateUrl: './brands-form.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrandsFormPage implements OnInit, OnDestroy {

    private _obsers: any[] = [];

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false),
        submitting: false,
    };

    viewData: any = {
        categories: new Array<CategoryModel>(),
        brandId: "",
        filterCategories$: new BehaviorSubject<any[]>([]),
    }

    brandForm: FormGroup;
    brandEmbryo: FormControl = new FormControl({});
    categoryData: any[] = [];
    tenants: TenantModel[] = [];
    users: UserInfoModel[] = [];
    brands: BrandModel[] = [];
    timmingMode: number = TimingMode.AlwaysOpen;
    imageFromUrl$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    tenantId: string = "";
    userId: string = "";
    sellingPointMaxWords = SellingPointMaxWords;
    language: string = "vi";

    constructor(
        private _router: Router,
        private _brandsState: BrandsState,
        private _brandService: BrandService,
        private _tenantService: TenantService,
        private _subheaderService: SubheaderService,
        private _translate: TranslateService,
        private _systemAlertService: SystemAlertService,
        private _appInsightService: AppInsightsUtility,
        private _appStatusUtil: AppStatusUtility,
        private _commonUtil: CommonUtility,
    ) {
        this.generateCreateForm();
    }

    ngOnInit(): void {
        this.viewControl.loading$.next(true);
        this.viewData.categories = this._brandsState.subCategories$.getValue();

        Promise.all([
            this._tenantService.getAll(),
            this._brandService.generateId()
        ]).then(value => {
            this.tenants = value[0];
            this.viewData.brandId = value[1];
            this.viewControl.loading$.next(false);
        });

        this.bindSubscribes();
        this.bindBreadcrumbs();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
        this._appStatusUtil.formIsEditing = false;
    }

    async ngAfterViewInit() {
        let url = `${window.location.origin}${this._router.url}`;

        this._appInsightService.trackPageView("New Brands", url);

        this.parseFormToEmbryo(this.brandForm);
    }

    save(): void {
        const controls = this.brandForm.controls;
        const appointmentControls = this.appointmentForm.controls;
        const shareControls = this.shareForm.controls;

        if (this.brandForm.invalid) {
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

        this.createBrand();
    }

    async onTenantsChanged() {
        this.viewControl.loading$.next(true);

        let allUsers = new Array<UserInfoModel>();
        allUsers = await this._tenantService.getUsers(this.tenantId);

        this.viewControl.loading$.next(false);

        this.userId = "";
        this.users = [];

        if (allUsers !== undefined && allUsers.length > 0) {
            this.users = allUsers.filter(x => x.RoleNames.indexOf(RoleType.BrandAdmin) !== -1);

            if (this.users.length > 0) {
                this.userId = this.users[0].Id;
            }
        }
    }

    private initFilterCategories(categories: CategoryModel[]): any[] {
        return categories.map(x => {
            return {
                id: x.Id,
                text: new LanguagePipe().transform(x.Name)
            }
        });
    }

    private async createBrand() {
        if (this.viewControl.submitting) {
            return;
        }

        this.viewControl.submitting = true;
        this.viewControl.loading$.next(true);

        let brand = this.parseForm(this.brandForm);

        let data = await this._brandService.createBrand(brand, this.tenantId, this.userId);

        this.viewControl.submitting = false;
        this.viewControl.loading$.next(false);

        if (data) {
            this._appStatusUtil.formIsEditing = false;
            this._systemAlertService.success(this._translate.instant("BRANDS.CREATE_SUCCESSFUL"));

            this._router.navigate(["/brands", this.viewData.brandId]);
        }
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "BRANDS.LIST", page: '/brands' },
            { title: "BRANDS.NEW_BRAND", page: '/brands/create' }
        ]);
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this._brandsState.subCategories$.subscribe(value => {
                if (value && value.length > 0) {
                    this.viewData.categories = value;
                    this.viewData.filterCategories$.next(this.initFilterCategories(this.viewData.categories));
                }
            })
        );

        this._obsers.push(
            this.brandForm.valueChanges.subscribe(() => {
                this.parseFormToEmbryo(this.brandForm);
            })
        );
    }

    private parseFormToEmbryo(form: FormGroup) {
        let preview: any = {
            Name: "",
            Slogan: "",
            SellingPointTitle: "",
            SellingPointDescription: "",
            Backgrounds: [],
            Share: {},
            Appointment: {},
        }

        preview.Name = form.get('BrandName').value;
        preview.Slogan = form.get('BrandDescription').value;
        preview.SellingPointTitle = form.get('SellingPointTitle').value;
        preview.SellingPointDescription = form.get('SellingPointDescription').value;
        preview.Backgrounds = form.get('BrandPoster').value;

        preview.Share = this.parseButtonOptionForm(this.shareForm);
        preview.Appointment = this.parseButtonOptionForm(this.appointmentForm);

        this.brandEmbryo.setValue(preview);
    }

    private parseForm(form: FormGroup): BrandModel {
        let brand = new BrandModel();

        brand.Id = this.viewData.brandId;
        brand.Name[this.language] = form.get('BrandName').value;
        brand.Description[this.language] = form.get('BrandDescription').value;
        brand.Tags = form.get('BrandTags').value.map(x => x.Name);
        brand.Utilities = form.get('Utilities').value;
        brand.Categories = form.get('BrandCategories').value;
        brand.Timing = form.get('Timing').value;

        if (form.get('BrandLogo').value) {
            form.get('BrandLogo').value.forEach(element => {
                brand.Logo = element.Url
            });
        }

        if (form.get('BrandMarker').value) {
            form.get('BrandMarker').value.forEach(element => {
                brand.Marker = element.Url
            });
        }

        brand.Contact.Phone = form.get('BrandPhones').value;

        if (form.get('BrandPoster').value) {
            form.get('BrandPoster').value.forEach(element => {
                if (element) {
                    brand.SellingPoint.Gallery.push(element);
                }
            });
        }

        brand.SellingPoint.Title = {
            "vi": form.get('SellingPointTitle').value,
            "en": form.get('SellingPointTitleEn').value
        };

        brand.SellingPoint.FullTitle = {
            "vi": form.get('SellingPointTitle').value,
            "en": form.get('SellingPointTitleEn').value
        };

        brand.SellingPoint.Description = {
            "vi": form.get('SellingPointDescription').value,
            "en": form.get('SellingPointDescriptionEn').value
        };

        brand.SellingPoint.Options = {
            AppointmentButton: this.parseButtonOptionForm(this.appointmentForm),
            ShareButton: this.parseButtonOptionForm(this.shareForm)
        };

        brand.Properties = form.get('NearMeBrand').value ? ["COL"] : [];

        return brand;
    }

    private generateCreateForm() {
        this.brandForm = new FormGroup({
            TenantId: new FormControl('', [<any>Validators.required, <any>Validators.minLength(1)]),
            UserId: new FormControl(''),

            BrandName: new FormControl('', [<any>Validators.required]),
            BrandDescription: new FormControl(''),
            BrandCategories: new FormControl([], [<any>Validators.required]),
            Utilities: new FormControl([]),

            BrandLogo: new FormControl([]),
            BrandTags: new FormControl([]),
            BrandMarker: new FormControl([]),

            SellingPointTitle: new FormControl('', [<any>Validators.required, <any>MaxWords.validate(SellingPointMaxWords.MaxTitle)]),
            SellingPointTitleEn: new FormControl('', [<any>MaxWords.validate(SellingPointMaxWords.MaxTitle)]),

            SellingPointDescription: new FormControl('', [<any>Validators.required, <any>MaxWords.validate(SellingPointMaxWords.MaxDescription)]),
            SellingPointDescriptionEn: new FormControl('', [<any>MaxWords.validate(SellingPointMaxWords.MaxDescription)]),

            BrandPoster: new FormControl([], [<any>Validators.required]),
            Video: new FormControl([]),

            BrandPhones: new FormControl([]),
            Timing: new FormControl(this.initAlwaysOpenTiming()),

            BrandEmbryo: new FormControl({}),

            NearMeBrand: new FormControl(false),

            AppointmentButton: new FormGroup({
                IsVisible: new FormControl(true),
                IsEnabled: new FormControl(true),
                LabelVi: new FormControl("be Here", [<any>Validators.required]),
                LabelEn: new FormControl("be Here", [<any>Validators.required])
            }),
            ShareButton: new FormGroup({
                IsVisible: new FormControl(true),
                IsEnabled: new FormControl(true),
                LabelVi: new FormControl("Chia sẻ", [<any>Validators.required]),
                LabelEn: new FormControl("Sharing", [<any>Validators.required])
            }),
        });

        this._obsers.push(this.brandForm.valueChanges.subscribe(() => {
            if (this.brandForm.dirty && !this._appStatusUtil.formIsEditing) {
                this._appStatusUtil.formIsEditing = true;
            }
        }));
    }

    private initAlwaysOpenTiming(): TimingModel {
        let timing: TimingModel = new TimingModel();

        timing.Open = "08:00:00";
        timing.Close = "22:00:00";
        timing.Is24H = false;

        for (let day of this._commonUtil.parseEnumToList(Day)) {
            let spec = new SpecificTimingModel();

            spec.Is24H = false;
            spec.Open = "08:00:00";
            spec.Close = "22:00:00";

            timing.Specific[day.value] = [spec];
        }

        return timing;
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
        return this.brandForm.get('AppointmentButton') as FormGroup;
    }

    get shareForm(): FormGroup {
        return this.brandForm.get('ShareButton') as FormGroup;
    }
}