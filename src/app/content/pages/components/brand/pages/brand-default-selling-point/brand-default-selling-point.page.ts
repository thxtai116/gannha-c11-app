import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import {
    BrandModel,
    GnActionModel,
    BrandDefaultSellingPointViewModel,

    SubheaderService,
    SystemAlertService,
    BrandService,

    ActionType,
    ResourceType,

    LanguagePipe,
    MaxWords,
    SellingPointMaxWords,
    GlobalState,
    ButtonOptionModel,
} from '../../../../../../core/core.module';

import { BrandState } from '../../states';

@Component({
    selector: 'm-brand-default-selling-point',
    templateUrl: './brand-default-selling-point.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrandDefaultSellingPointPage implements OnInit, OnDestroy {

    private _obsers: any[] = [];

    private _readyConditions: Map<string, boolean> = new Map([
        ["Brand", false]
    ]);

    lang: string = "vi";

    formDefaultSP: FormGroup;

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
        private _brandState: BrandState,
        private _subheaderService: SubheaderService,
        private _brandService: BrandService,
        private _systemAlertService: SystemAlertService,
        private _translate: TranslateService,
        private _globalState: GlobalState,
    ) {
        this.formDefaultSP = this.generateCreateForm();
    }

    async ngOnInit() {
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
        const controls = this.formDefaultSP.controls;

        if (this.formDefaultSP.invalid) {
            Object.keys(controls).forEach(controlName => {
                controls[controlName].markAsTouched();
                controls[controlName].markAsDirty();
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

        let brand = this.parseBrandFromForm(this.formDefaultSP);

        let data = await this._brandService.updateBrandDefaultSP(brand);

        this.viewControl.submitting = false;

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

            this.viewModel.sellingPoint = this.parseViewModel(this.viewData.brand);

            this.parseFormGroup(JSON.parse(JSON.stringify(this.viewData.brand)));

            this.parseFormToEmbryo(this.formDefaultSP);

            this.viewControl.loading$.next(false);
        }
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: new LanguagePipe().transform(this.viewData.brand.Name), page: `/brand` },
            { title: "BRANDS.DEFAULT_SELLING_POINT", page: `/brand/default-selling-point` }
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
            this.formDefaultSP.valueChanges.subscribe(value => {
                this.parseFormToEmbryo(this.formDefaultSP);
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

        preview.Share = this.viewData.brand.SellingPoint.Options ? this.viewData.brand.SellingPoint.Options['ShareButton'] : new ButtonOptionModel();
        preview.Appointment = this.viewData.brand.SellingPoint.Options ? this.viewData.brand.SellingPoint.Options['AppointmentButton'] : new ButtonOptionModel();

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
        this.formDefaultSP.get('SellingPointTitle').setValue(new LanguagePipe().transform(brand.SellingPoint.Title));
        this.formDefaultSP.get('SellingPointTitleEn').setValue(new LanguagePipe().transform(brand.SellingPoint.Title, "en"));

        this.formDefaultSP.get('SellingPointDescription').setValue(new LanguagePipe().transform(brand.SellingPoint.Description));
        this.formDefaultSP.get('SellingPointDescriptionEn').setValue(new LanguagePipe().transform(brand.SellingPoint.Description, "en"));

        this.formDefaultSP.get('SellingPointPosters').setValue(brand.SellingPoint.Gallery || []);
        this.formDefaultSP.get('SellingPointVideo').setValue(brand.Gallery.filter(x => x.Type == ResourceType.HLS || x.Type == ResourceType.Video) || []);
        this.formDefaultSP.get('SellingPointActions').setValue(JSON.parse(JSON.stringify(brand.Actions.filter(x => x.Service.ActionType == ActionType.SpService).map(x => x.Service))));
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

        brand.SellingPoint.Options = this.viewData.brand.SellingPoint.Options;

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

    private generateCreateForm(): FormGroup {
        return new FormGroup({
            SellingPointTitle: new FormControl('', [<any>Validators.required, <any>MaxWords.validate(SellingPointMaxWords.MaxTitle)]),
            SellingPointTitleEn: new FormControl('', [<any>MaxWords.validate(SellingPointMaxWords.MaxTitle)]),
            SellingPointDescription: new FormControl('', [<any>Validators.required, <any>MaxWords.validate(SellingPointMaxWords.MaxDescription)]),
            SellingPointDescriptionEn: new FormControl('', [<any>MaxWords.validate(SellingPointMaxWords.MaxDescription)]),
            SellingPointPosters: new FormControl([], [<any>Validators.required]),
            SellingPointActions: new FormControl([], [<any>Validators.required]),
            SellingPointVideo: new FormControl([])
        });
    }
}
